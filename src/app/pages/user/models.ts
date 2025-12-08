export interface UserListItem {
    id: number;
    name: string;
    email: string;
    isEmailAuth: 0 | 1;
    isAdmin: 0 | 1;
    created: string;
}

export interface UserListResponse {
    list: UserListItem[];
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
}
