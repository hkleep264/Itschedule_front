import {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

const BOARD_INSERT_API = 'http://localhost:4567/schedule/board/insert'
const USER_ALL_API = 'http://localhost:4567/schedule/board/alluser'

type ProjectMember = {
    userId: string
    userName: string
    email: string
}

export const BoardCreatePage: FC = () => {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // 멤버 관련 상태
    const [currentMembers, setCurrentMembers] = useState<ProjectMember[]>([])
    const [allUsers, setAllUsers] = useState<ProjectMember[]>([])
    const [availableUsers, setAvailableUsers] = useState<ProjectMember[]>([])

    // 전체 유저 로딩
    const loadAllUsers = async () => {
        try {
            const res = await axios.post(
                USER_ALL_API,
                {},
                {withCredentials: true}
            )
            const list: ProjectMember[] = res.data.userAllList ?? []
            setAllUsers(list)
            setAvailableUsers(list) // 처음에는 전부 "추가 가능"
        } catch (e) {
            console.error(e)
        }
    }

    // availableUsers = allUsers - currentMembers
    const refreshAvailableUsers = (
        members: ProjectMember[],
        all: ProjectMember[]
    ) => {
        const filtered = all.filter(
            (u) => !members.some((m) => m.userId === u.userId)
        )
        setAvailableUsers(filtered)
    }

    const addMember = (user: ProjectMember) => {
        const newMembers = [...currentMembers, user]
        setCurrentMembers(newMembers)
        refreshAvailableUsers(newMembers, allUsers)
    }

    const removeMember = (user: ProjectMember) => {
        const newMembers = currentMembers.filter((m) => m.userId !== user.userId)
        setCurrentMembers(newMembers)
        refreshAvailableUsers(newMembers, allUsers)
    }

    const save = async () => {
        if (!name.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        try {
            await axios.post(
                BOARD_INSERT_API,
                {
                    name,
                    content,
                    startDate,
                    endDate,
                    memberList: currentMembers,
                },
                {withCredentials: true}
            )

            alert('등록 완료')
            navigate('/project/board')
        } catch (e) {
            console.error(e)
            alert('등록 중 오류가 발생했습니다.')
        }
    }

    useEffect(() => {
        loadAllUsers()
    }, [])

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title fw-bold fs-3'>새 게시글 등록</h3>
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

                {/* 프로젝트 멤버 설정 */}
                <div className='mb-10'>
                    <label className='fw-bold fs-5 mb-2'>프로젝트 참여 멤버</label>

                    <div className='row'>
                        {/* 현재 참여자 */}
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

                        {/* 추가 가능한 멤버 */}
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

                {/* 버튼 */}
                <div className='d-flex justify-content-end gap-2'>
                    <button className='btn btn-light-secondary' onClick={() => navigate('/board')}>
                        취소
                    </button>
                    <button className='btn btn-primary' onClick={save}>
                        등록
                    </button>
                </div>
            </div>
        </div>
    )
}
