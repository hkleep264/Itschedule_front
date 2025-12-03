// src/app/config/api.ts
import axios from 'axios'

// .env.development / .env.production 에서 온값
 const API_BASE_URL = import.meta.env.VITE_APP_API_URL || '/schedule'

// 공통 axios 인스턴스
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

// ----------------- Auth -----------------
export const LOGIN_URL = '/login'
export const REGISTER_URL = '/register'
export const VERIFY_TOKEN_URL = '/verify_token'
export const CHECK_ME_URL = '/me'

// ----------------- Project(Board) -----------------
export const BOARD_LIST_URL = '/board/list'
export const BOARD_INFO_URL = '/board/info'
export const BOARD_CREATE_URL = '/board/insert'
export const BOARD_UPDATE_URL = '/board/update'
export const BOARD_ALL_USER_URL = 'board/alluser'
export const BOARD_QUICK_UPDATE_URL = '/board/quick_update'

// ----------------- Issue -----------------
export const ISSUE_LIST_URL = '/issue/list'
export const ISSUE_INFO_URL = '/issue/info'
export const ISSUE_CREATE_URL = '/issue/insert'
export const ISSUE_UPDATE_URL = '/issue/update'
export const ISSUE_MEMBER_LIST_URL = '/issue/memberList'
export const ISSUE_PROJECT_LIST_URL = '/issue/projectList'
export const ISSUE_QUICK_UPDATE_URL = '/issue/quick_update'

// ----------------- Task -----------------
export const TASK_LIST_URL = '/task/list'
export const TASK_UPDATE_URL = '/task/update'
export const TASK_QUICK_UPDATE_URL = '/task/quick_update'
