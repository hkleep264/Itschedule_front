import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'

const BOARD_INFO_API = 'http://localhost:4567/schedule/board/info'
const BOARD_UPDATE_API = 'http://localhost:4567/schedule/board/update'
const USER_ALL_API = 'http://localhost:4567/schedule/board/alluser'

type ProjectMember = {
    userId: string
    userName: string
    email: string
}

export const BoardEditPage: FC = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    //멤버 관련 상태
    const [currentMembers, setCurrentMembers] = useState<ProjectMember[]>([])
    const [allUsers, setAllUsers] = useState<ProjectMember[]>([])
    const [availableUsers, setAvailableUsers] = useState<ProjectMember[]>([])

    // --------------------------------------------------------
    // 1) 상세정보 로딩 (boardInfo + userList)
    // --------------------------------------------------------
    const loadDetail = async () => {
        const res = await axios.post(
            BOARD_INFO_API,
            {boardId: id},
            {withCredentials: true}
        )
        const d = res.data.boardInfo

        setName(d.name)
        setContent(d.content)
        setStartDate(d.startDate?.substring(0, 10))
        setEndDate(d.endDate?.substring(0, 10))

        // 현재 참여자
        setCurrentMembers(res.data.userList ?? [])
    }

    // --------------------------------------------------------
    // 2) 전체 유저 리스트 로딩
    // --------------------------------------------------------
    const loadAllUsers = async () => {
        const res = await axios.post(
            USER_ALL_API,
            {},
            {withCredentials: true}
        )
        setAllUsers(res.data.userAllList ?? [])
    }

    // --------------------------------------------------------
    // 3) 참여자 / 전체 유저 비교 → 추가 가능한 유저 목록 생성
    // --------------------------------------------------------
    const updateAvailableUsers = (members: ProjectMember[], all: ProjectMember[]) => {
        const filtered = all.filter(
            (u) => !members.some((m) => m.userId === u.userId)
        )
        setAvailableUsers(filtered)
    }

    // --------------------------------------------------------
    // 4) Add / Remove 기능
    // --------------------------------------------------------
    const addMember = (user: ProjectMember) => {
        const newMembers = [...currentMembers, user]
        setCurrentMembers(newMembers)

        const newAvailable = availableUsers.filter((u) => u.userId !== user.userId)
        setAvailableUsers(newAvailable)
    }

    const removeMember = (user: ProjectMember) => {
        const newMembers = currentMembers.filter((m) => m.userId !== user.userId)
        setCurrentMembers(newMembers)

        // 제거한 멤버는 다시 추가 후보로
        setAvailableUsers([...availableUsers, user])
    }

    // --------------------------------------------------------
    // 5) Save
    // --------------------------------------------------------
    const save = async () => {
        try {
            await axios.post(
                BOARD_UPDATE_API,
                {
                    boardId: id,
                    name,
                    content,
                    startDate,
                    endDate,
                    memberList: currentMembers, // 멤버 정보 저장
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

    // --------------------------------------------------------
    // 초기 호출
    // --------------------------------------------------------
    useEffect(() => {
        const init = async () => {
            await loadDetail()
            await loadAllUsers()
        }
        init()
    }, [id])

    // 참여자 / 전체유저 변경되면 availableUsers 갱신
    useEffect(() => {
        updateAvailableUsers(currentMembers, allUsers)
    }, [currentMembers, allUsers])

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title fw-bold fs-3'>게시글 수정</h3>
            </div>

            <div className='card-body py-5'>
                {/* 제목 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>제목</label>
                    <input
                        type='text'
                        className='form-control'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* 기간 */}
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

                {/* 내용 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>내용</label>
                    <textarea
                        className='form-control'
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>

                {/* 🔥 프로젝트 멤버 편집 */}
                <div className='mb-10'>
                    <label className='fw-bold fs-5 mb-2'>프로젝트 참여 멤버</label>

                    <div className='row'>
                        {/* 왼쪽: 현재 참여자 */}
                        <div className='col-md-6'>
                            <div className='card border'>
                                <div className='card-header py-3'>
                                    <strong>현재 참여자</strong>
                                </div>
                                <div className='card-body'>
                                    {currentMembers.length === 0 && (
                                        <div className='text-muted'>참여 중인 멤버 없음</div>
                                    )}

                                    {currentMembers.map((user) => (
                                        <div
                                            key={user.userId}
                                            className='d-flex justify-content-between align-items-center border-bottom py-2'
                                        >
                                            <div>
                                                <div className='fw-bold'>{user.userName}</div>
                                                <div className='text-muted fs-8'>{user.email}</div>
                                            </div>

                                            <button
                                                className='btn btn-sm btn-light-danger'
                                                onClick={() => removeMember(user)}
                                            >
                                                제거
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: 추가 가능한 모든 멤버 */}
                        <div className='col-md-6'>
                            <div className='card border'>
                                <div className='card-header py-3'>
                                    <strong>추가 가능한 멤버</strong>
                                </div>
                                <div className='card-body'>
                                    {availableUsers.length === 0 && (
                                        <div className='text-muted'>추가 가능한 멤버 없음</div>
                                    )}

                                    {availableUsers.map((user) => (
                                        <div
                                            key={user.userId}
                                            className='d-flex justify-content-between align-items-center border-bottom py-2'
                                        >
                                            <div>
                                                <div className='fw-bold'>{user.userName}</div>
                                                <div className='text-muted fs-8'>{user.email}</div>
                                            </div>

                                            <button
                                                className='btn btn-sm btn-light-primary'
                                                onClick={() => addMember(user)}
                                            >
                                                추가
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save / Cancel */}
                <div className='d-flex justify-content-end gap-2'>
                    <button
                        className='btn btn-light-secondary'
                        onClick={() => navigate(`/board/${id}`)}
                    >
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
