

import {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
// import {getUserByToken, register} from '../core/_requests'
import {register} from '../core/_requests'
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'
// import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {PasswordMeterComponent} from '../../../../_metronic/assets/ts/components'
// import {useAuth} from '../core/Auth'
// 회원가입 페이지 UI 부분

const initialValues = {
  name: '',
  // lastname: '',
  email: '',
  password: '',
  changepassword: '',
  acceptTerms: false,
}

const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('First name is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  // lastname: Yup.string()
  //   .min(3, 'Minimum 3 symbols')
  //   .max(50, 'Maximum 50 symbols')
  //   .required('Last name is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  changepassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.bool().required('You must accept the terms and conditions'),
})

export function Registration() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  // const {saveAuth, setCurrentUser} = useAuth()
  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      setStatus('')
      try {
        const {data} = await register(
          values.email,
          values.name,
          // values.lastname,
          values.password,
          values.changepassword
        )

        //자바 구조에 맞게 변경한 내역
        if (data.code === "200") {
          // 성공 처리
          setStatus('회원가입이 완료되었습니다. 로그인 해주세요.')
          setSubmitting(false)
          setLoading(false)

          // 바로 로그인 화면으로 이동
          navigate('/auth/login')
          return
        } else {
          // 서버가 200인데 실패 표시인 경우
          setStatus(data.msg || '회원가입에 실패했습니다.')
          formik.status = '회원가입에 실패했습니다.'
          setSubmitting(false)
          setLoading(false)
        }
      } catch (error: any) {
        console.error(error)
        // 여기로 오는 건 HTTP 에러(4xx/5xx) 같은 진짜 예외일 때
        const msg =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        setStatus(msg)
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_signup_form'
      onSubmit={formik.handleSubmit}
    >
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        {/* begin::Title */}
        <h1 className='text-gray-900 fw-bolder mb-3'>Sign Up</h1>
        {/* end::Title */}

        {/*<div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div>*/}
      </div>
      {/* end::Heading */}

      {/* begin::Login options */}
      {/*<div className='row g-3 mb-9'>
         begin::Col
        <div className='col-md-6'>
           begin::Google link
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Logo'
              src={toAbsoluteUrl('media/svg/brand-logos/google-icon.svg')}
              className='h-15px me-3'
            />
            Sign in with Google
          </a>
           end::Google link
        </div>
         end::Col

         begin::Col
        <div className='col-md-6'>
           begin::Google link
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Logo'
              src={toAbsoluteUrl('media/svg/brand-logos/apple-black.svg')}
              className='theme-light-show h-15px me-3'
            />
            <img
              alt='Logo'
              src={toAbsoluteUrl('media/svg/brand-logos/apple-black-dark.svg')}
              className='theme-dark-show h-15px me-3'
            />
            Sign in with Apple
          </a>
           end::Google link
        </div>
         end::Col
      </div>*/}
      {/* end::Login options */}

      {/*<div className='separator separator-content my-14'>
        <span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
      </div>*/}

      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* begin::Form group name */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>name</label>
        <input
          placeholder='name'
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('name')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.name && formik.errors.name,
            },
            {
              'is-valid': formik.touched.name && !formik.errors.name,
            }
          )}
        />
        {formik.touched.name && formik.errors.name && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.name}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}
      {/*<div className='fv-row mb-8'>
         begin::Form group Lastname
        <label className='form-label fw-bolder text-gray-900 fs-6'>Last name</label>
        <input
          placeholder='Last name'
          type='text'
          autoComplete='off'
          {...formik.getFieldProps('lastname')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.lastname && formik.errors.lastname,
            },
            {
              'is-valid': formik.touched.lastname && !formik.errors.lastname,
            }
          )}
        />
        {formik.touched.lastname && formik.errors.lastname && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.lastname}</span>
            </div>
          </div>
        )}
         end::Form group
      </div>*/}

      {/* begin::Form group Email */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Email</label>
        <input
          placeholder='Email'
          type='email'
          autoComplete='off'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {
              'is-valid': formik.touched.email && !formik.errors.email,
            }
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group Password */}
      <div className='fv-row mb-8' data-kt-password-meter='true'>
        <div className='mb-1'>
          <label className='form-label fw-bolder text-gray-900 fs-6'>Password</label>
          <div className='position-relative mb-3'>
            <input
              type='password'
              placeholder='Password'
              autoComplete='off'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password,
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password,
                }
              )}
            />
            {formik.touched.password && formik.errors.password && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.password}</span>
                </div>
              </div>
            )}
          </div>
          {/* begin::Meter */}
          <div
            className='d-flex align-items-center mb-3'
            data-kt-password-meter-control='highlight'
          >
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
          </div>
          {/* end::Meter */}
        </div>
        <div className='text-muted'>
          Use 8 or more characters with a mix of letters, numbers & symbols.
        </div>
      </div>
      {/* end::Form group */}

      {/* begin::Form group Confirm password */}
      <div className='fv-row mb-5'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>Confirm Password</label>
        <input
          type='password'
          placeholder='Password confirmation'
          autoComplete='off'
          {...formik.getFieldProps('changepassword')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.changepassword && formik.errors.changepassword,
            },
            {
              'is-valid': formik.touched.changepassword && !formik.errors.changepassword,
            }
          )}
        />
        {formik.touched.changepassword && formik.errors.changepassword && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.changepassword}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
          <input
            className='form-check-input'
            type='checkbox'
            id='kt_login_toc_agree'
            {...formik.getFieldProps('acceptTerms')}
          />
          <span>
            I Accept the Terms.
          </span>
          {/*<span>
            I Accept the{' '}
            <a
                href='https://keenthemes.com/metronic/?page=faq'
                target='_blank'
                className='ms-1 link-primary'
            >
              Terms
            </a>
            .
          </span>*/}
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='text-center'>
        <button
          type='submit'
          id='kt_sign_up_submit'
          className='btn btn-lg btn-primary w-100 mb-5'
          disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
        >
          {!loading && <span className='indicator-label'>Submit</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_signup_form_cancel_button'
            className='btn btn-lg btn-light-primary w-100 mb-5'
          >
            Cancel
          </button>
        </Link>
      </div>
      {/* end::Form group */}
    </form>
  )
}
