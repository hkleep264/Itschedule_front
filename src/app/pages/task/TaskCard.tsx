import React from 'react'
import {Draggable} from '@hello-pangea/dnd'
import {Task, getPriorityLabel} from './taskTypes'

type Props = {
    task: Task
    index: number
    onClick: (task: Task) => void
}

const TaskCard: React.FC<Props> = ({task, index, onClick}) => {
    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided) => (
                <div
                    className='card mb-4 cursor-pointer'
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                >
                    <div className='card-body p-4'>
                        <div className='fw-bold mb-2'>{task.title}</div>
                        <div className='text-muted small'>
                            우선순위: {getPriorityLabel(task.priority)}<br />
                            진행률: {
                            task.progress === 'NOT_STARTED'
                                ? '준비중'
                                : task.progress === 'IN_PROGRESS'
                                    ? '진행 중'
                                    : '완료'
                        }
                            {task.assigneeName && (
                                <>
                                    <br />
                                    담당자: {task.assigneeName}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}

export default TaskCard
