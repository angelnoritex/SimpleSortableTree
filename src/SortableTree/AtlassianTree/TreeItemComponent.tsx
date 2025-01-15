import React, { Fragment, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';


import ReactDOM, { flushSync } from 'react-dom';
import invariant from 'tiny-invariant';



import FocusRing from '@atlaskit/focus-ring';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { DependencyContext, TreeContext } from './tree-context';

import type{ Instruction, ItemMode, } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import type {  TreeItem as TreeItemType } from './types';



const IDENT = 10;


function GroupIcon({ expanded }: { expanded: boolean }) {
	const iconStyle = {
		width: `${IDENT +14}` +'px',
		height: '24px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		transform: expanded ? 'scale(0.75)  rotate(90deg)' : 'scale(0.75) ',
	
		transition: 'transform 0.2s ease'
	  };
	return  <span style={iconStyle}>
	▶
  </span>
}

function Icon({ item }: { item: TreeItemType }) {
	if (item.children?.length) {
		return <GroupIcon expanded={item.expanded ?? false} />;
	}
	return <i style={{marginLeft: IDENT + 4, height: '24px',}}></i>
}
// @ts-ignore
import styles from './styles.module.css'

function Preview({ item }: { item: TreeItemType }) {
	return <div className={styles.previewStyles}>{item.slug}</div>;
}

function getParentLevelOfInstruction(instruction: Instruction): number {
	if (instruction.type === 'instruction-blocked') {
		return getParentLevelOfInstruction(instruction.desired);
	}
	if (instruction.type === 'reparent') {
		return instruction.desiredLevel - 1;
	}
	return instruction.currentLevel - 1;
}

function delay({ waitMs: timeMs, fn }: { waitMs: number; fn: () => void }): () => void {
	let timeoutId: number | null = window.setTimeout(() => {
		timeoutId = null;
		fn();
	}, timeMs);
	return function cancel() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
}

const TreeItem = memo(function TreeItem({
	item,
	mode,
	level,
	index,
}: {
	item: TreeItemType;
	mode: ItemMode;
	level: number;
	index: number;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	const [state, setState] = useState<'idle' | 'dragging' | 'preview' | 'parent-of-instruction'>(
		'idle',
	);
	const [instruction, setInstruction] = useState<Instruction | null>(null);
	const cancelExpandRef = useRef<(() => void) | null>(null);

	const { dispatch, uniqueContextId, getPathToItem, registerTreeItem } = useContext(TreeContext);
	const { DropIndicator, attachInstruction, extractInstruction } = useContext(DependencyContext);
	const toggleOpen = useCallback(() => {
		dispatch({ type: 'toggle', itemId: item.id });
	}, [dispatch, item]);

	// const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		invariant(buttonRef.current);
		// invariant(actionMenuTriggerRef.current);
		return registerTreeItem({
			itemId: item.id,
			element: buttonRef.current,
			// @ts-ignore
			actionMenuTrigger: undefined,
		});
	}, [item.id, registerTreeItem]);

	const cancelExpand = useCallback(() => {
		cancelExpandRef.current?.();
		cancelExpandRef.current = null;
	}, []);

	const clearParentOfInstructionState = useCallback(() => {
		setState((current) => (current === 'parent-of-instruction' ? 'idle' : current));
	}, []);

	// When an item has an instruction applied
	// we are highlighting it's parent item for improved clarity
	const shouldHighlightParent = useCallback(
		(location: DragLocationHistory): boolean => {
			const target = location.current.dropTargets[0];

			if (!target) {
				return false;
			}

			const instruction = extractInstruction(target.data);

			if (!instruction) {
				return false;
			}

			const targetId = target.data.id;
			invariant(typeof targetId === 'string');

			const path = getPathToItem(targetId);
			const parentLevel: number = getParentLevelOfInstruction(instruction);
			const parentId = path[parentLevel];
			return parentId === item.id;
		},
		[getPathToItem, extractInstruction, item],
	);

	useEffect(() => {
		invariant(buttonRef.current);

		function updateIsParentOfInstruction({ location }: { location: DragLocationHistory }) {
			if (shouldHighlightParent(location)) {
				setState('parent-of-instruction');
				return;
			}
			clearParentOfInstructionState();
		}

		return combine(
			draggable({
				element: buttonRef.current,
				getInitialData: () => ({
					id: item.id,
					type: 'tree-item',
					isOpenOnDragStart: item.expanded,
					uniqueContextId,
				}),
				onGenerateDragPreview: ({ nativeSetDragImage }) => {
					setCustomNativeDragPreview({
						getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
						render: ({ container }) => {
							// @ts-ignore
							const root = ReactDOM.createRoot(container);
							root.render(<Preview item={item} />);
							return () => root.unmount();
						},
						nativeSetDragImage,
					});
				},
				onDragStart: ({ source }) => {
					setState('dragging');
					// collapse open items during a drag
					if (source.data.isOpenOnDragStart) {
						dispatch({ type: 'collapse', itemId: item.id });
					}
				},
				onDrop: ({ source }) => {
					setState('idle');
					if (source.data.isOpenOnDragStart) {
						dispatch({ type: 'expand', itemId: item.id });
					}
				},
			}),
			dropTargetForElements({
				element: buttonRef.current,
				getData: ({ input, element }) => {
					const data = { id: item.id };

					return attachInstruction(data, {
						input,
						element,
						indentPerLevel:IDENT,
						currentLevel: level,
						mode,
						block: [],
					});
				},
				canDrop: ({ source }) =>
					source.data.type === 'tree-item' && source.data.uniqueContextId === uniqueContextId,
				getIsSticky: () => true,
				onDrag: ({ self, source }) => {
					const instruction = extractInstruction(self.data);

					if (source.data.id !== item.id) {
						// expand after 500ms if still merging
						if (
							instruction?.type === 'make-child' &&
							item.children?.length &&
							!item.expanded &&
							!cancelExpandRef.current
						) {
							cancelExpandRef.current = delay({
								waitMs: 500,
								fn: () => dispatch({ type: 'expand', itemId: item.id }),
							});
						}
						if (instruction?.type !== 'make-child' && cancelExpandRef.current) {
							cancelExpand();
						}

						setInstruction(instruction);
						return;
					}
					if (instruction?.type === 'reparent') {
						setInstruction(instruction);
						return;
					}
					setInstruction(null);
				},
				onDragLeave: () => {
					cancelExpand();
					setInstruction(null);
				},
				onDrop: () => {
					cancelExpand();
					setInstruction(null);
				},
			}),
			monitorForElements({
				canMonitor: ({ source }) => source.data.uniqueContextId === uniqueContextId,
				onDragStart: updateIsParentOfInstruction,
				onDrag: updateIsParentOfInstruction,
				onDrop() {
					clearParentOfInstructionState();
				},
			}),
		);
	}, [
		dispatch,
		item,
		mode,
		level,
		cancelExpand,
		uniqueContextId,
		extractInstruction,
		attachInstruction,
		getPathToItem,
		clearParentOfInstructionState,
		shouldHighlightParent,
	]);

	useEffect(
		function mount() {
			return function unmount() {
				cancelExpand();
			};
		},
		[cancelExpand],
	);

	const aria = (() => {
		if (!item.children?.length) {
			return undefined;
		}
		return {
			'aria-expanded': item.expanded,
			'aria-controls': `tree-item-${item.id}--subtree`,
		};
	})();

	const handleRemove =()=>{
		dispatch({ type: 'remove', itemId: item.id })
	}
	return (
		<Fragment>
			<div
				className={state === 'idle' ? styles.outerHoverStyles : ' '}
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				style={{ position: 'relative' }}
			>
				<FocusRing isInset>
					<button
						{...aria}
						className={styles.outerButtonStyles}
						id={`tree-item-${item.id}`}
						
						ref={buttonRef}
						type="button"
						
						style={{ paddingLeft: level * IDENT }}
						data-index={index}
						data-level={level}
						data-testid={`tree-item-${item.id}`}
					>
						<span
							className={
								styles.innerButtonStyles +' '+
								state === 'dragging'
									? styles.innerDraggingStyles
									: state === 'parent-of-instruction'
										? styles.parentOfInstructionStyles
										: undefined
							}
						>
							<span onClick={toggleOpen}>
								<Icon  item={item} />
							</span>
							<span className={styles.labelStyles}>{item.title}</span>
					
						</span>
						{instruction ? <DropIndicator instruction={instruction} /> : null}

						<span style={{display:'flex', marginLeft:'auto', marginRight: '.75rem', gap:'2px'}}>
							<button onClick={()=>dispatch({ type: 'copy', itemId: item.id })}>copy</button>
							<button onClick={handleRemove}>del</button>

						</span>

						
					</button>
				</FocusRing>
				

			</div>
			{item.children && item.children?.length && item.expanded ? (
				<div id={aria?.['aria-controls']}>
					{item.children?.map((child, index, array) => {
						const childType: ItemMode = (() => {
							if (child.children?.length && child.expanded) {
								return 'expanded';
							}

							if (index === array.length - 1) {
								return 'last-in-group';
							}

							return 'standard';
						})();
						return (
							<TreeItem
								item={child}
								key={child.id}
								level={level + 1}
								mode={childType}
								index={index}
							/>
						);
					})}
				</div>
			) : null}
		
		</Fragment>
	);
});

export default TreeItem;
