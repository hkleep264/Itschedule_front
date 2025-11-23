import axios from "axios";
import { AuthModel, UserModel } from "./_models";

// const API_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = '/schedule';

//API 호출담당 로그인, 회원가입 부분

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/login`;
// export const LOGIN_URL = `http://localhost:4567/schedule/login`;
// export const LOGIN_URL = `http://172.30.1.8:4567/schedule/login`;
export const REGISTER_URL = `${API_URL}/register`;
// export const REGISTER_URL = 'http://localhost:4567/schedule/signup';
// export const REGISTER_URL = 'http://172.30.1.8:4567/schedule/signup';
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

type LoginResponse = {
    msg: string
    code: string
    message: string
}

export function login(email: string, password: string) {
  return axios.post<LoginResponse>(
      LOGIN_URL,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  )
}

// // Server should return AuthModel
// export function login(email: string, password: string) {
//   const hashpwd = SHA256(password);
//   return axios.post<AuthModel>(LOGIN_URL, {
//     email,
//     // password,
//     hashpwd,
//   });
// }

// Server should return AuthModel
// export function register(
//   email: string,
//   name: string,
//   // lastname: string,
//   password: string,
//   password_confirmation: string
// ) {
//   return axios.post(REGISTER_URL, {
//     email,
//     name: name,
//     // last_name: lastname,
//     password,
//     password_confirmation,
//   });
// }

// Server should return AuthModel
export function register(
    email: string,
    name: string,
    // lastname: string,
    password: string,
    password_confirmation: string
) {
    console.log("ggi");
  return axios.post(
      REGISTER_URL,
      {
        name: name,
        email: email,
        password: password,
        password2 : password_confirmation
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  )
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}
