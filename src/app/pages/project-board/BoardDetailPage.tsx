import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'

type BoardDetail = {
    boardInfo: any;
    id: number
    name: string
    content: string
    writer: string
    created: string
    updated: string
    startDate: string
    endDate: string
}

const BOARD_INFO_API = 'http://localhost:4567/schedule/board/info'

export const BoardDetailPage: FC = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<BoardDetail | null>(null)

    const loadDetail = async () => {
        try {
            const res = await axios.post(BOARD_INFO_API,
                {
                    boardId: id
                },
                {withCredentials: true})
            setData(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadDetail()
    }, [id])

    if (!data) {
        return (
            <div className='text-center py-10'>
                <span className='spinner-border spinner-border-sm'></span>
            </div>
        )
    }

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5 d-flex justify-content-between align-items-start'>
                <div className='d-flex flex-column'>
                    <span className='fw-bold fs-2 mb-1'>{data.boardInfo.name}</span>

                    <span className='text-muted fs-7'>
                      작성자: {data.boardInfo.writer} · 작성일: {data.boardInfo.created}
                    </span>
                </div>

                <div className='d-flex gap-2'>
                    <button
                        className='btn btn-light-primary btn-sm'
                        onClick={() => navigate(`/board/${id}/edit`)}
                    >
                        <i className='bi bi-pencil-square me-1'></i> 편집
                    </button>

                    <button className='btn btn-light-secondary btn-sm' onClick={() => navigate('/board')}>
                        목록
                    </button>
                </div>
            </div>


            <div className='card-body py-5'>
                <div>
                <label className='fw-bold mb-2'>내용</label>
                <div className='text-gray-900' style={{whiteSpace: 'pre-line'}}>
                    {data.boardInfo.content}
                </div>
            </div>
                <br/>
                <br/>
                <br/>
                <div className='mb-5'>
                    <label className='fw-bold mb-2'>기간</label>
                    <div className='text-muted'>
                        {data.boardInfo.startDate} ~ {data.boardInfo.endDate}
                    </div>
                </div>
            </div>
        </div>
    )
}
