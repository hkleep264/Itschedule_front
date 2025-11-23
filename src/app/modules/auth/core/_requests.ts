import axios from "axios";
import { AuthModel, UserModel } from "./_models";
import CryptoJS from 'crypto-js';

const API_URL = import.meta.env.VITE_APP_API_URL;

//API 호출담당 로그인, 회원가입 부분

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
// export const LOGIN_URL = `${API_URL}/login`;
export const LOGIN_URL = `http://localhost:4567/schedule/login`;
// export const LOGIN_URL = `http://172.30.1.8:4567/schedule/login`;
// export const REGISTER_URL = `${API_URL}/register`;
export const REGISTER_URL = 'http://localhost:4567/schedule/signup';
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;
export const AES_KEY = "itschedulehash";


export function login(email: string, password: string) {
  const hashpwd = getHashEnc(password);
  return axios.post(
      LOGIN_URL,
      {
        email: email,
        password: hashpwd,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  )
}

export function getHashEnc(password: string){
  const encrypted = CryptoJS.AES.encrypt(password, AES_KEY).toString();
  return encrypted;

}

export function getHashDec(password: string){
  const bytes = CryptoJS.AES.decrypt(AES_KEY, password);
  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decrypted;

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
  const hashpwd = getHashEnc(password);
  return axios.post(
      REGISTER_URL,
      {
        name: name,
        email: email,
        password: hashpwd,
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
