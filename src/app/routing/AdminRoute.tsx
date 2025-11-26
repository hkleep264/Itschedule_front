import {useAuth} from '../modules/auth'
import {Navigate, Outlet} from 'react-router-dom'

export const AdminRoute = () => {
    const {currentUser} = useAuth()

    // 아직 로딩중일 수도 있으니 보호
    if (currentUser === undefined) {
        // AuthInit 로딩 중이면 잠깐 비워두기
        return <></>
    }

    // 관리자가 아닌 경우 → 대시보드로 보내기
    if (!currentUser?.isAdmin) {
        return <Navigate to='/dashboard' replace />
    }

    // 관리자면 정상적으로 다음 라우트로
    return <Outlet />
}
