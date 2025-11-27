import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'

const BOARD_INFO_API = 'http://localhost:4567/schedule/board/info'
const BOARD_UPDATE_API = 'http://localhost:4567/schedule/board/update'

export const BoardEditPage: FC = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const loadDetail = async () => {
        const res = await axios.post(BOARD_INFO_API, {boardId: id}, {withCredentials: true})
        const d = res.data
        setName(d.boardInfo.name)
        setContent(d.boardInfo.content)
        setStartDate(d.boardInfo.startDate?.substring(0, 10))
        setEndDate(d.boardInfo.endDate?.substring(0, 10))
    }

    const save = async () => {
        try {
            await axios.post(
                BOARD_UPDATE_API,
                {
                    boardId : id,
                    name: name,
                    content : content,
                    startDate: startDate,
                    endDate: endDate,
                },
                {withCredentials: true}
            )
            alert('수정 완료')
            navigate(`/board/${id}`)
        } catch (e) {
            console.error(e)
            alert('수정 중 오류 발생')
        }
    }

    useEffect(() => {
        loadDetail()
    }, [id])

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title fw-bold fs-3'>게시글 수정</h3>
            </div>

            <div className='card-body py-5'>

                <div className='mb-5'>
                    <label className='form-label fw-bold'>제목</label>
                    <input
                        type='text'
                        className='form-control'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className='mb-5'>
                    <label className='form-label fw-bold'>기간</label>
                    <div className='d-flex gap-2'>
                        <input
                            type='date'
                            className='form-control'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type='date'
                            className='form-control'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className='mb-5'>
                    <label className='form-label fw-bold'>내용</label>
                    <textarea
                        className='form-control'
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>

                <div className='d-flex justify-content-end gap-2'>
                    <button className='btn btn-light-secondary' onClick={() => navigate(`/board/${id}`)}>
                        취소
                    </button>
                    <button className='btn btn-primary' onClick={save}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}
