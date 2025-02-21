import React, { Fragment, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';
import FocusRing from '@atlaskit/focus-ring';
import './styles.css';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { DependencyContext, TreeContext } from './tree-context';

const IDENT = 10;

function GroupIcon({ expanded }) {
	const iconStyle = {
		width: `${IDENT + 14}px`,
		height: '24px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		transform: expanded ? 'scale(0.75) rotate(90deg)' : 'scale(0.75)',
		transition: 'transform 0.2s ease',
	};
	return <span style={iconStyle}>▶</span>;
}

function Icon({ item }) {
	if (item.children?.length) {
		return <GroupIcon expanded={item.expanded ?? false} />;
	}
	return <i style={{ marginLeft: IDENT + 4, height: '24px' }}></i>;
}

function Preview({ item }) {
	return <div className="previewStyles">{item.slug}</div>;
}

function getParentLevelOfInstruction(instruction) {
	if (instruction.type === 'instruction-blocked') {
		return getParentLevelOfInstruction(instruction.desired);
	}
	if (instruction.type === 'reparent') {
		return instruction.desiredLevel - 1;
	}
	return instruction.currentLevel - 1;
}

function delay({ waitMs, fn }) {
	let timeoutId = window.setTimeout(() => {
		timeoutId = null;
		fn();
	}, waitMs);
	return function cancel() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
}

const TreeItem = memo(function TreeItem({ item, mode, level, index }) {
	const buttonRef = useRef(null);
	const [state, setState] = useState('idle');
	const [instruction, setInstruction] = useState(null);
	const cancelExpandRef = useRef(null);

	const { dispatch, uniqueContextId, getPathToItem, registerTreeItem } = useContext(TreeContext);
	const { DropIndicator, attachInstruction, extractInstruction } = useContext(DependencyContext);

	const toggleOpen = useCallback(() => {
		dispatch({ type: 'toggle', itemId: item.id });
	}, [dispatch, item]);

	useEffect(() => {
		invariant(buttonRef.current);
		return registerTreeItem({
			itemId: item.id,
			element: buttonRef.current,
		});
	}, [item.id, registerTreeItem]);

	const cancelExpand = useCallback(() => {
		cancelExpandRef.current?.();
		cancelExpandRef.current = null;
	}, []);

	const clearParentOfInstructionState = useCallback(() => {
		setState((current) => (current === 'parent-of-instruction' ? 'idle' : current));
	}, []);

	const shouldHighlightParent = useCallback(
		(location) => {
			const target = location.current.dropTargets[0];
			if (!target) return false;

			const instruction = extractInstruction(target.data);
			if (!instruction) return false;

			const targetId = target.data.id;
			invariant(typeof targetId === 'string');

			const path = getPathToItem(targetId);
			const parentLevel = getParentLevelOfInstruction(instruction);
			const parentId = path[parentLevel];
			return parentId === item.id;
		},
		[getPathToItem, extractInstruction, item],
	);

	useEffect(() => {
		invariant(buttonRef.current);

		function updateIsParentOfInstruction({ location }) {
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
							const root = ReactDOM.createRoot(container);
							root.render(<Preview item={item} />);
							return () => root.unmount();
						},
						nativeSetDragImage,
					});
				},
				onDragStart: ({ source }) => {
					setState('dragging');
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
						indentPerLevel: IDENT,
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
				onDrop: clearParentOfInstructionState,
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

	useEffect(() => {
		return () => {
			cancelExpand();
		};
	}, [cancelExpand]);

	const aria = item.children?.length
		? {
				'aria-expanded': item.expanded,
				'aria-controls': `tree-item-${item.id}--subtree`,
			}
		: undefined;

	const handleRemove = useCallback(() => {
		dispatch({ type: 'remove', itemId: item.id });
	}, [dispatch, item.id]);

	const onUpdate = useCallback(
		(data) => {
			dispatch({ type: 'update', item: data });
		},
		[dispatch],
	);

	return (
		<Fragment>
			<div className={state === 'idle' ? 'outerHoverStyles' : ''} style={{ position: 'relative' }}>
				<FocusRing isInset>
					<button
						{...aria}
						className={`outerButtonStyles ${item.hide ? 'menuHidden' : ''}`}
						id={`tree-item-${item.id}`}
						ref={buttonRef}
						type="button"
						style={{ paddingLeft: level * IDENT }}
						data-index={index}
						data-level={level}
						data-testid={`tree-item-${item.id}`}
					>
						<span className={'innerButtonStyles ' + (state === 'dragging' ? 'innerDraggingStyles' : state === 'parent-of-instruction' ? 'parentOfInstructionStyles' : '')}>
							<span onClick={toggleOpen}>
								<Icon item={item} />
							</span>
							<span className="labelStyles">{item.title}</span>
						</span>
						{instruction ? <DropIndicator instruction={instruction} /> : null}
						<span className="btn-group">
							<button className="btn" onClick={() => dispatch({ type: 'hide', itemId: item.id })}>
								<i className="far fa-eye"></i>
							</button>
							<button className="btn" onClick={() => dispatch({ type: 'copy', itemId: item.id })}>
								<i className="far fa-copy"></i>
							</button>
							<button className="btn" onClick={handleRemove}>
								<i className="far fa-trash-alt"></i>
							</button>
						</span>
					</button>
				</FocusRing>
			</div>
			{item.children && item.children.length && item.expanded ? (
				<div id={aria?.['aria-controls']}>
					{item.children.map((child, index, array) => {
						const childType = child.children?.length && child.expanded ? 'expanded' : index === array.length - 1 ? 'last-in-group' : 'standard';
						return <TreeItem item={child} key={child.id} level={level + 1} mode={childType} index={index} />;
					})}
				</div>
			) : null}
		</Fragment>
	);
});

export default TreeItem;
