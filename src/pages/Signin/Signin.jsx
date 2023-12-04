import React from 'react';
import RootContainer from '../../components/RootContainer/RootContainer';
import { css } from '@emotion/react';
/** @jsxImportSource @emotion/react */
import * as S from "./Style"
import kakaologin from "../../assets/kakao_login_large_narrow.png"
import naverlogin from "../../assets/naver login.png"
import { useNavigate } from 'react-router-dom';
import MainLogo from "../../assets/MainLogin2.png"

function Signin(props) {

    const handleKaKaoLogin = () => {
        window.location.href = "http://3.36.41.19/oauth2/authorization/kakao";
    }

    const handleNaverLogin = () => {
        window.location.href = "http://3.36.41.19/oauth2/authorization/naver";
    }

    return (
        <RootContainer>
            <div css={S.SLayout}>
                <div css={S.SContainer}>
                    <h1 css={S.STitle}>로그인</h1>
                    <h2 css={S.STitle2}>학습 나침반의 가치를 느껴보세요.</h2>

                    <div css={S.SLoginBox}>
                        <img src={MainLogo} alt="" css={S.SMainLogo}/>
                        <div css={S.SkakaoLoginBtn}><img css={S.SKakaoBtn} src={kakaologin} onClick={handleKaKaoLogin} /></div>
                        <div css={S.SNaverLoginBtn}><img css={S.SNaverBtn} src={naverlogin} onClick={handleNaverLogin} /></div>
                    </div>
                </div>
            </div>
        </RootContainer>
    );
}

export default Signin;