import React, { useEffect, useState } from 'react';
import RootContainer from '../../components/RootContainer/RootContainer';
import SelectBtn from '../../components/SelectBtn/SelectBtn';
/** @jsxImportSource @emotion/react */
import * as S from "./Style"
import FindAcademiesSidebar from '../../components/FindAcademiesSidebar/FindAcademiesSidebar';
import defalutProfile from './고양이.jpg';
import { RiAdvertisementFill } from 'react-icons/ri';
import Modal from '../../components/Modal/LocationModal/Modal';
import { useQuery } from 'react-query';
import { instance } from '../../api/config/instance';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { selectedCategoryState, selectedLocationState } from '../../store/Modal';
import CategoryModal from '../../components/Modal/CategoryModal/CategoryModal';

function FindAcademies(props) {
    const navigate = useNavigate();

    const [ hasOptions, setHasOptions ] = useState(false); // 조건 여부(지역, 카테고리)
    const [selectedLocation, setSelectedLocation] = useRecoilState(selectedLocationState); // 지역
    const [ selectedCategory, setSelectedCategory ] = useRecoilState(selectedCategoryState); // 카테고리
    const [ selectedContent, setSelectedContent ] = useState(""); // 학원 이름
    let aca_nm = "";

    console.log(hasOptions)
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
    const [ categoryModalIsOpen, setCategoryModalIsOpen ] = useState(false);

    const [ totalCount, setTotalCount ] = useState(0);   // 아무 조건도 주지 않았을 경우 가져올 총 학원 수 2100개 조건이 있을경우 가지고온 학원 수에 따라 달라짐
    const { page } = useParams();
    const [ academyList, setAcademyList ] = useState();

    const educationOfficeCodes = ["B10", "C10", "D10", "E10", "F10", "G10", "H10", "I10", "J10", "K10", "M10", "N10", "P10", "Q10", "R10", "S10" , "T10"]
    
    // 조건이 없을 경우
    const fetchAcademyData = async () => {
        const allAcademyData = [];
        setTotalCount(2100);
        for (const code of educationOfficeCodes) {
            try {
                const options = {
                    params: {
                        KEY: "5234f1f7767447b4abc251d862f281e5",
                        Type: "json",
                        pIndex: page,
                        pSize: (code === "B10" || code === "J10") ? 3 : 1,
                        ATPT_OFCDC_SC_CODE: code
                    }
                };

                const response = await instance.get("https://open.neis.go.kr/hub/acaInsTiInfo", options);

                if (Object.keys(response?.data).includes("acaInsTiInfo")) {
                    response.data.acaInsTiInfo[1]?.row.forEach((academy) => {
                        allAcademyData.push(academy);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }
        setAcademyList(allAcademyData);
    };

    // 조건이 있는 경우(조건을 줄 경우 무조건 지역을 선택하도록)
    const selectAcademyData = async () => {
        const allAcademyData = [];
        try {
            const options = {
                params: {
                    KEY: "5234f1f7767447b4abc251d862f281e5",
                    Type: "json",
                    pIndex: page,
                    pSize: 21,
                    ATPT_OFCDC_SC_CODE: selectedLocation.atpt_ofcdc_sc_code,
                }
            }

            // ADMST_ZONE_NM이 selectedLocation에 존재하는지 확인
            if (selectedLocation.admst_zone_nm) {
                options.params.ADMST_ZONE_NM = selectedLocation.admst_zone_nm;
            }

            // selectedCategory.realm_sc_nm가 존재하는지 확인
            if (selectedCategory.realm_sc_nm) {
                options.params.REALM_SC_NM = selectedCategory.realm_sc_nm;
            }
            // selectedCategory.le_crse_nm가 존재하는지 확인
            if (selectedCategory.le_crse_nm) {
                options.params.LE_CRSE_NM = selectedCategory.le_crse_nm;
            }

            // selectedContent(ACA_NM)가 존재하는지 확인
            if (selectedContent) {
                options.params.ACA_NM = selectedContent;
            }
    
            // api, options를 get 요청
            const response = await instance.get("https://open.neis.go.kr/hub/acaInsTiInfo", options);

            if (Object.keys(response?.data).includes("acaInsTiInfo")) {
                // 조건에 해당하는 총 학원수로 다시 페이지네이션
                setTotalCount(response.data.acaInsTiInfo[0]?.head[0].list_total_count);
                response.data.acaInsTiInfo[1]?.row.forEach((academy) => {
                    allAcademyData.push(academy);
                });
            }
        } catch (error) {
            console.error(error);
        }
        setAcademyList(allAcademyData);
    };

    // 조건이 생길 때 학원목록 업데이트
    useEffect(() => {
        if (!hasOptions) {
            fetchAcademyData();
        } else {
            selectAcademyData();
        }
    }, [page, hasOptions, selectedLocation, selectedCategory, selectedContent]);
    
    // 조건이 변경될 때 hasOptions 업데이트
    useEffect(() => {
        if (selectedLocation.atpt_ofcdc_sc_code) {
            setHasOptions(true);
            navigate("/academy/find/1");
        } else {
            setHasOptions(false);
        }
    }, [selectedLocation]);

    const handleInputOnChange = (e) => {
        aca_nm = e.target.value
    }

    const handleSelectContent = () => {
        
        setSelectedContent(aca_nm);
        
    }

    const pagenation = () => {
        const totalAcademyCount = totalCount;
        const lastPage = totalAcademyCount % 21 === 0 
            ? totalAcademyCount / 21
            // Math.floor(): 절삭 = 나머지 버림
            : Math.floor(totalAcademyCount / 21) + 1

        const startIndex = parseInt(page) % 5 === 0 ? parseInt(page) - 4 : parseInt(page) - (parseInt(page) % 5) + 1;
        const endIndex = startIndex + 4 <= lastPage ? startIndex + 4 : lastPage;
        const pageNumbers = [];

        for (let i = startIndex; i <= endIndex; i++) {
            pageNumbers.push(i);
        }

        return (
            <>
                <button disabled={parseInt(page) === 1} onClick={() => {
                    navigate(`/academy/find/${parseInt(page) - 1}`);
                }}>&#60;</button>

                {pageNumbers.map(num => {
                    return <button key={num} onClick={() => {
                        navigate(`/academy/find/${num}`)
                    }}>{num}</button>
                })}

                <button disabled={parseInt(page) === lastPage} onClick={() => {
                    navigate(`/academy/find/${parseInt(page) + 1}`);
                }}>&#62;</button>
            </>

        )
    }

    const openLocationModal = () => {
        setModalIsOpen(true);
    };

    const openCategoryModal = () => {
        setCategoryModalIsOpen(true);
        
    };
    


    return (
        <RootContainer>
            <div css={S.SearchLayout}>
                <h1>학원찾기</h1>
                <div css={S.SearchContainer}>
                    <div onClick={openLocationModal}>
                        <SelectBtn>지역 선택</SelectBtn>
                    </div>
                    <div onClick={openCategoryModal}>
                        <SelectBtn>카테고리 선택</SelectBtn>
                    </div>
                    <input type="text" placeholder='나에게 맞는 학원을 찾아보세요' onChange={handleInputOnChange}/>
                    <button onClick={handleSelectContent}>검색</button>
                </div>
            </div>
            <div css={S.PageLayout}>
                <FindAcademiesSidebar />
                <div css={S.PageContainer}>
                    <div css={S.InfoBox}>
                        <div>{totalCount}개의 학원이 있습니다.</div>
                        <span css={S.Span(hasOptions)}>조건이 없으면 2100개까지 보여집니다. 찾는 결과가 없다면 검색 조건을 이용해 주세요</span>
                    </div>
                    <div>
                        <div css={S.HeaderBox}>
                            <h3>이런 학원은 어떠세요?</h3>
                            <div>
                                <span>광고</span>
                                <RiAdvertisementFill size={22}/>
                            </div>
                        </div>
                        <ul css={S.UlBox}>
                            <li css={S.LiBox} className='recent'>
                                <img src={defalutProfile} alt="" />
                                <strong>학원 이름</strong>
                                <div>학원 설명</div>
                            </li>
                            <li css={S.LiBox} className='recent'>
                                <img src={defalutProfile} alt="" />
                                <strong>학원 이름</strong>
                                <div>학원 설명</div>
                            </li>
                            <li css={S.LiBox} className='recent'>
                                <img src={defalutProfile} alt="" />
                                <strong>학원 이름</strong>
                                <div>학원 설명</div>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div css={S.HeaderBox}>
                            <h3>검색된 정보</h3>
                            <select css={S.ClassifyBox} name="classifyBox" id="">
                                <option value="최신순">최신순</option>
                                <option value="인기순">인기순</option>
                                <option value="좋아요순">좋아요순</option>
                            </select>
                        </div>
                        <ul css={S.UlBox}>
                            {academyList?.map((academy) => {
                                const key = `${academy.ATPT_OFCDC_SC_CODE}_${academy.ACA_ASNUM}`;
                                return <li key={key} css={S.LiBox} onClick={()=> {navigate(`/academy/info?education_office_codes=${academy.ATPT_OFCDC_SC_CODE}&academy_num=${academy.ACA_ASNUM}`)}}>
                                    <img src={defalutProfile} alt="" />
                                    <strong>{academy.ACA_NM}</strong>
                                    <div>{academy.FA_RDNMA}</div>
                                </li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
            <div css={S.PageButtonContainer}>
                {pagenation()}
            </div>
            <Modal modalIsOpen={modalIsOpen} 
                setModalIsOpen={setModalIsOpen} 
                setSelectedLocation={setSelectedLocation}/>
            <CategoryModal modalIsOpen={categoryModalIsOpen} 
                setModalIsOpen={setCategoryModalIsOpen} 
                setSelectedCategory={setSelectedCategory}/>

            <span css={S.Span(hasOptions)}>조건없이 검색 시 100페이지까지 보여집니다. 찾는 결과가 없다면 검색 조건을 이용해 주세요</span>
            {/* <Modal modalIsOpen={modalIsOpen} 
                setModalIsOpen={setModalIsOpen} 
                modalName={modalName}
                setAcademyList={setAcademyList}
                setSelectedLocation={setSelectedLocation}/> */}

        </RootContainer>
    );
}

export default FindAcademies;