import {FC, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import axios from 'axios'
import {Issue, MemberItem, priorityOptions} from './issueTypes'

const ISSUE_INFO_API = 'http://localhost:4567/schedule/issue/info'
const ISSUE_UPDATE_API = 'http://localhost:4567/schedule/issue/update'
const ISSUE_MEMBER_LIST_API = 'http://localhost:4567/schedule/issue/memberList'

export const IssueEditPage: FC = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [issue, setIssue] = useState<Issue | null>(null)
    const [memberList, setMemberList] = useState<MemberItem[]>([])

    const [title, setTitle] = useState('')
    const [issueType, setIssueType] = useState('')
    const [priority, setPriority] = useState<'1' | '2' | '3'>('2')
    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [assigneeId, setAssigneeId] = useState<string>('')

    // 상세 조회 후 Issue 를 반환하도록 변경
    const loadDetail = async (): Promise<Issue> => {
        const res = await axios.post(
            ISSUE_INFO_API,
            {issueId: id},
            {withCredentials: true}
        )
        const d: Issue = res.data.issueInfo ?? res.data

        setIssue(d)
        setTitle(d.name)
        setIssueType(d.issueType)
        setPriority(d.issuePriority)
        setContent(d.content)
        setStartDate(d.startDate?.substring(0, 10))
        setEndDate(d.endDate?.substring(0, 10))
        setAssigneeId(d.managerUserId)

        return d // 🔥 projectId를 쓰기 위해 반환
    }

    // projectId 를 받아서 멤버 조회
    const loadMemberList = async (projectId: number) => {
        const res = await axios.post(
            ISSUE_MEMBER_LIST_API,
            {projectId}, // 🔥 프로젝트 ID 전달
            {withCredentials: true}
        )
        setMemberList(res.data.memberList ?? res.data)
    }

    const save = async () => {
        if (!issue) return

        try {
            await axios.post(
                ISSUE_UPDATE_API,
                {
                    issueId: issue.issueId,
                    name: title,
                    issueType,
                    issuePriority: priority,
                    content,
                    startDate,
                    endDate,
                    managerUserId: assigneeId,
                },
                {withCredentials: true}
            )
            alert('수정되었습니다.')
            navigate(`/issue/${issue.issueId}`)
        } catch (e) {
            console.error(e)
            alert('수정 중 오류가 발생했습니다.')
        }
    }

    useEffect(() => {
        const init = async () => {
            const detail = await loadDetail()
            await loadMemberList(detail.projectId)
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (!issue) {
        return (
            <div className='card'>
                <div className='card-body text-center py-10'>
                    <span className='spinner-border spinner-border-sm'></span>
                </div>
            </div>
        )
    }

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title fw-bold fs-3'>이슈 수정</h3>
            </div>

            <div className='card-body py-5'>
                {/* 제목 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 제목</label>
                    <input
                        type='text'
                        className='form-control'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* 프로젝트 (수정 불가) */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>프로젝트</label>
                    <input
                        type='text'
                        className='form-control bg-light'
                        value={issue.projectName}
                        disabled
                    />
                </div>

                {/* 이슈 타입 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 타입</label>
                    <input
                        type='text'
                        className='form-control'
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                    />
                </div>

                {/* 중요도 + 담당자 */}
                <div className='mb-5 row'>
                    <div className='col-md-6 mb-3'>
                        <label className='form-label fw-bold'>중요도</label>
                        <select
                            className='form-select'
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as '1' | '2' | '3')}
                        >
                            {priorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='col-md-6 mb-3'>
                        <label className='form-label fw-bold'>담당자</label>
                        <select
                            className='form-select'
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            <option value=''>담당자를 선택하세요</option>
                            {memberList.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                    {m.userName} ({m.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 기간 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 기간</label>
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

                {/* 버튼 */}
                <div className='d-flex justify-content-end gap-2'>
                    <button className='btn btn-light-secondary' onClick={() => navigate(`/issue/${id}`)}>
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
