// src/_metronic/partials/layout/header-menus/HeaderNotificationsMenu.tsx

import React, {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {apiClient, ALERT_LIST_URL, ALERT_UPDATE_URL} from '../../../../app/config/api'

interface AlertItem {
  id: number
  type: 0 | 1        // 0: 프로젝트, 1: 이슈
  content: string
  userId: number
  targetId: number   // 프로젝트/이슈 ID
  status: 0 | 1      // 0: 미확인(Alerts), 1: 확인(Log)
  updated: string
  created: string
  projectId: number
}

const HeaderNotificationsMenu: FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const res = await apiClient.post(ALERT_LIST_URL, {})

      let list = []

      // 응답이 배열 형태인 경우
      if (Array.isArray(res.data)) {
        list = res.data
      }
      // 응답이 {list: [...]} 형태인 경우
      else if (Array.isArray(res.data?.list)) {
        list = res.data.list
      }

      setAlerts(list)
    } catch (e) {
      console.error('alert_list 불러오기 실패', e)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadAlerts()
  }, [])

  const unread = Array.isArray(alerts) ? alerts.filter((a) => a.status === 0) : []
  const logs = Array.isArray(alerts) ? alerts.filter((a) => a.status === 1) : []

  const formatDateTime = (value: string) => {
    // '2025-12-09 13:33:19' → '2025-12-09 13:33'
    return value?.substring(0, 16)
  }

  // 단건 읽음 처리 (본문 클릭)
  const handleReadOne = async (item: AlertItem) => {
    if (item.status === 1) return

    try {
      await apiClient.post(ALERT_UPDATE_URL, {
        alertId: item.id,
        status: 1,
      })

      setAlerts((prev) =>
          prev.map((a) => (a.id === item.id ? {...a, status: 1} : a))
      )
    } catch (e) {
      console.error('alert_status_update 실패', e)
    }
  }

  // 우측 작은 버튼 클릭 → 해당 페이지로 이동
  const handleGoTarget = (item: AlertItem) => {
    if (item.type === 0) {
      // 프로젝트
      navigate(`/project/${item.targetId}`)
    } else {
      // 이슈
      navigate(`/issue/detail/${item.targetId}`)
    }
  }

  // 전체 확인 (status=0 → 1)
  const handleReadAll = async () => {
    if (unread.length === 0) return

    try {
      // 개별 업데이트 (백엔드에 일괄 API 있으면 그걸로 교체 가능)
      await Promise.all(
          unread.map((item) =>
              apiClient.post(ALERT_UPDATE_URL, {
                alertId: item.id,
                status: 1,
              })
          )
      )

      setAlerts((prev) => prev.map((a) => ({...a, status: 1})))
    } catch (e) {
      console.error('전체 확인 실패', e)
    }
  }

  return (
      <div
          className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
          data-kt-menu='true'
      >
        {/* 헤더 영역 */}
        <div
            className='d-flex flex-column bgi-no-repeat rounded-top'
            style={{backgroundImage: "url('/media/misc/menu-header-bg.jpg')"}}
        >
          <div className='d-flex justify-content-between align-items-center px-9 mt-9 mb-4'>
            <div>
              <h3 className='text-white fw-bold mb-1'>
                Notifications{' '}
                <span className='fs-8 opacity-75 ps-2'>
                {unread.length} unread
              </span>
              </h3>
              <div className='text-white-50 fs-8'>
                {loading ? '불러오는 중...' : '알림 및 로그를 확인하세요'}
              </div>
            </div>

            {/* 전체 확인 버튼 */}
            <div>
              <button
                  type='button'
                  className='btn btn-sm btn-light text-dark'
                  disabled={unread.length === 0}
                  onClick={handleReadAll}
              >
                전체 확인
              </button>
            </div>
          </div>

          {/* 탭: Alerts / Logs */}
          <ul className='nav nav-line-tabs nav-line-tabs-2x nav-stretch fw-bold px-9'>
            <li className='nav-item'>
              <a
                  className='nav-link text-white opacity-75 opacity-state-100 pb-4 active'
                  data-bs-toggle='tab'
                  href='#kt_topbar_notifications_alerts'
              >
                Alerts
              </a>
            </li>
            <li className='nav-item'>
              <a
                  className='nav-link text-white opacity-75 opacity-state-100 pb-4'
                  data-bs-toggle='tab'
                  href='#kt_topbar_notifications_logs'
              >
                Logs
              </a>
            </li>
          </ul>
        </div>

        {/* 탭 컨텐츠 */}
        <div className='tab-content'>
          {/* Alerts (status=0) */}
          <div
              className='tab-pane fade show active'
              id='kt_topbar_notifications_alerts'
              role='tabpanel'
          >
            <div className='scroll-y mh-325px my-5 px-8'>
              {unread.length === 0 && !loading && (
                  <div className='text-center text-muted py-5'>
                    새로운 알림이 없습니다.
                  </div>
              )}

              {unread.map((item) => (
                  <div
                      key={item.id}
                      className='d-flex flex-stack py-3 border-bottom cursor-pointer'
                  >
                    {/* 왼쪽: 아이콘 + 내용 (클릭 시 읽음 처리) */}
                    <div
                        className='d-flex align-items-center flex-grow-1'
                        onClick={() => handleReadOne(item)}
                    >
                      <div className='symbol symbol-35px me-4'>
                    <span className='symbol-label bg-light-warning'>
                      <i className='bi bi-bell-fill text-warning fs-4'></i>
                    </span>
                      </div>

                      <div className='d-flex flex-column'>
                    <span className='fw-bold text-gray-800 fs-6'>
                      {item.type === 0 ? '프로젝트 알림' : '이슈 알림'}
                    </span>
                        <span className='text-gray-600 fs-7'>{item.content}</span>
                        <span className='text-gray-400 fs-8'>
                      {formatDateTime(item.created)}
                    </span>
                      </div>
                    </div>

                    {/* 오른쪽: 이동 버튼 */}
                    <button
                        type='button'
                        className='btn btn-icon btn-sm btn-light ms-3'
                        onClick={() => handleGoTarget(item)}
                        title='해당 페이지 이동'
                    >
                      <i className='bi bi-box-arrow-up-right'></i>
                    </button>
                  </div>
              ))}
            </div>
          </div>

          {/* Logs (status=1) */}
          <div
              className='tab-pane fade'
              id='kt_topbar_notifications_logs'
              role='tabpanel'
          >
            <div className='scroll-y mh-325px my-5 px-8'>
              {logs.length === 0 && !loading && (
                  <div className='text-center text-muted py-5'>
                    로그가 없습니다.
                  </div>
              )}

              {logs.map((item) => (
                  <div
                      key={item.id}
                      className='d-flex flex-stack py-3 border-bottom'
                  >
                    <div className='d-flex align-items-center flex-grow-1'>
                      <div className='symbol symbol-35px me-4'>
                    <span className='symbol-label bg-light-secondary'>
                      <i className='bi bi-clock-history text-secondary fs-4'></i>
                    </span>
                      </div>

                      <div className='d-flex flex-column'>
                    <span className='fw-bold text-gray-800 fs-6'>
                      {item.type === 0 ? '프로젝트 로그' : '이슈 로그'}
                    </span>
                        <span className='text-gray-600 fs-7'>{item.content}</span>
                        <span className='text-gray-400 fs-8'>
                      {formatDateTime(item.updated)}
                    </span>
                      </div>
                    </div>

                    <button
                        type='button'
                        className='btn btn-icon btn-sm btn-light ms-3'
                        onClick={() => handleGoTarget(item)}
                        title='해당 페이지 이동'
                    >
                      <i className='bi bi-box-arrow-up-right'></i>
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}

export {HeaderNotificationsMenu}
