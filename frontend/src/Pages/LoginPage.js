import React, { useState, useCallback } from 'react';
import { Tabs, ConfigProvider } from 'antd';
import './css/LoginPage.css'
import axios from 'axios';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
import { particlesConfig } from './particlesConfig';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import toast, { Toaster } from "react-hot-toast";


const { TabPane } = Tabs;

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const notifySuccess = (message) => {
        toast.success(message, {
            position: "bottom-center",
        });
    };
    const notifyFailure = (message) => {
        toast.error(message, {
            position: "bottom-center",
        });
    };
    const particlesInit = useCallback(async engine => {
        console.log(engine);
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };


    const handleLoginSubmit = async (values) => {
        axios.defaults.validateStatus = () => true;
        console.log("values", values);
        console.log("values email", values.username)
        try {
            const response = await axios.post('http://localhost:8000/auth/login/', {
                "password": values.password,
                "email": values.username,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200 || response.status === 201) {
                console.log('Login successful', response);

                // Store the tokens in localStorage or a more secure storage method
                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                console.log("res", response.data)
                window.location.href = "/home"
            }
            else {
                notifyFailure("Invalid Credentials");
            }

            // Redirect the user or update app state
        } catch (err) {
            console.error('Login error', err.response.data);
        }

        // let formData = new FormData();

        // for (let key in values) {
        //     formData.append(key, values[key]);
        // }
        // axios('/api/auth/login', {
        //     method: "post",
        //     withCredentials: true,
        //     data: formData,
        //     headers: {
        //         'Content-Type': 'multipart/form-data'
        //     }
        // }).then((response) => {
        //     console.log("response")
        //     console.log(response)

        //     if (response.status === 200) {
        //         localStorage.setItem('token', response.data.access_token);
        //         axios('/api/auth/user', {
        //             method: "get",
        //             withCredentials: true,
        //             headers: {
        //                 Authorization: `Bearer ${response.data.access_token}`,
        //             }
        //         }).then((res) => {
        //             console.log("res", res.data)
        //             if (res.data.permission !== 0) {
        //                 window.location.href = "/upload";
        //             }
        //             else {
        //                 notifyFailure("You have been banned from the system")
        //             }
        //         })
        //             .catch((err) => {
        //                 console.log(err);
        //             });
        //         // window.location.href = "/home";
        //     }
        //     else {
        //         console.log("failed")
        //         notifyFailure(response.data.detail);
        //     }
        // }
        // ).catch((error) => {
        //     console.log("error");
        //     console.log(error.data.detail)
        // });

    };

    const handleSignupSubmit = async (values) => {
        axios.defaults.validateStatus = () => true;
        try {
            const response = await axios.post('http://localhost:8000/auth/register/', {
                "username": values.username,
                "email": values.Signemail,
                "password": values.signupPassword
            });
            console.log('Registration successful', response.data);
            if (response.status === 201) {
                notifySuccess("Signup Successful!");
                setActiveTab('login');
            }
            else {
                console.log("failed")
                notifyFailure(response.data.detail);
            }
        } catch (err) {
            console.log("error");
            console.log(err)
        }


        // axios.defaults.validateStatus = () => true;
        // const request = {
        //     "data": {
        //         "username": values.username,
        //         "email": values.Signemail,
        //         "password": values.signupPassword
        //     }
        // }
        // axios('/api/auth/register', { method: "post", withCredentials: true, data: request })
        //     .then((response) => {
        //         console.log("response")
        //         console.log(response)
        //         if (response.status === 200) {
        //             notifySuccess("Signup Successful!");
        //             setActiveTab('login');
        //         }
        //         else {
        //             console.log("failed")
        //             notifyFailure(response.data.detail);
        //         }
        //     })
        //     .catch((error) => {
        //         console.log("error");
        //         console.log(error)
        //     });
    };



    const validatePassword = (password) => {
        const passwordPattern = /^.{8,}$/;
        return passwordPattern.test(password);
    };
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#2c2c2e',
                    borderRadius: 6,
                    fontFamily: 'Quicksand, sans-serif',
                },
            }}
        >
            <Particles
                id="tsparticles"
                className="particles-canvas"
                init={particlesInit}
                loaded={particlesLoaded}
                options={particlesConfig}
            />
            <div className='login-container'>

                {/* create text at top of login box */}
                <div className='login-text'>
                    <h1>Welcome to Video Annotation Tool!</h1>
                    <p>Sign in or create an account to get started.</p>
                </div>
                <div className='login-box'>

                    <Tabs activeKey={activeTab} onChange={handleTabChange}>
                        <TabPane tab="Login" key="login">
                            <LoginForm handleLoginSubmit={handleLoginSubmit} validatePassword={validatePassword} />
                        </TabPane>
                        <TabPane tab="Signup" key="signup">
                            <SignupForm handleSignupSubmit={handleSignupSubmit} validatePassword={validatePassword} />
                        </TabPane>
                    </Tabs>
                </div>
                <Toaster />
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;
