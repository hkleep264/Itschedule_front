import {FC, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import axios from 'axios'
import {Issue, getPriorityLabel} from './issueTypes'

const ISSUE_INFO_API = 'http://localhost:4567/schedule/issue/info'

export const IssueDetailPage: FC = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [issue, setIssue] = useState<Issue | null>(null)

    const loadDetail = async () => {
        try {
            const res = await axios.post(
                ISSUE_INFO_API,
                {issueId: id}, // 서버 파라미터 이름에 맞게 수정
                {withCredentials: true}
            )
            setIssue(res.data.issueInfo ?? res.data) // 응답 구조에 맞게 조정
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadDetail()
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
            <div className='card-header border-0 pt-5 d-flex justify-content-between align-items-start'>
                <div className='d-flex flex-column'>
                    <span className='fw-bold fs-2 mb-1'>{issue.name}</span>
                    <span className='text-muted fs-7'>
            프로젝트: {issue.projectName} · 유형: {issue.issueType} · 중요도:{' '}
                        {getPriorityLabel(issue.issuePriority)} · 담당자: {issue.managerName}
          </span>
                    <span className='text-muted fs-8 mt-1'>
            기간: {issue.startDate} ~ {issue.endDate}
          </span>
                </div>

                <div className='d-flex gap-2'>
                    <button
                        className='btn btn-light-primary btn-sm'
                        onClick={() => navigate(`/issue/${id}/edit`)}
                    >
                        <i className='bi bi-pencil-square me-1'></i> 편집
                    </button>
                    <button className='btn btn-light-secondary btn-sm' onClick={() => navigate('/issue')}>
                        목록
                    </button>
                </div>
            </div>

            <div className='card-body py-5'>
                <div className='mb-5'>
                    <label className='fw-bold mb-2'>내용</label>
                    <div className='text-gray-900' style={{whiteSpace: 'pre-line'}}>
                        {issue.content}
                    </div>
                </div>
            </div>
        </div>
    )
}
