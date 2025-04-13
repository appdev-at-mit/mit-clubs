import React, { useEffect, useState } from "react";
import Navbar from "../modules/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBBtn, MDBTypography, MDBIcon } from 'mdb-react-ui-kit';


function Profile() {
    return(
        <>
        <Navbar />
        <div style={{ backgroundColor: '#eee' }}>
            <MDBContainer className="container">
                <MDBRow className="justify-content-center align-items-center h-100 ">
                <MDBCol md="12" xl="4">
                <MDBCard className="mt-5" style={{ borderRadius: '15px' }}>
                    <MDBCardBody className="text-center">
                        <div className="d-flex justify-content-center mt-3 mb-4">
                        <MDBCardImage
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                            className="rounded-circle"
                            fluid
                            style={{ width: '100px' }}
                        />
                        </div>
                        <MDBTypography tag="h4">Name</MDBTypography>
                        <MDBCardText className="text-muted mb-4">Class of 2027</MDBCardText>
                        <div className="d-flex justify-content-between text-center mt-5 mb-2 m-20">
                            <div>
                                <MDBCardText className="mb-1 h5">2</MDBCardText>
                                <MDBCardText className="small text-muted mb-0">Events</MDBCardText>
                            </div>
                            <div className="px-3">
                                <MDBCardText className="mb-1 h5">5</MDBCardText>
                                <MDBCardText className="small text-muted mb-0">Groups</MDBCardText>
                            </div>
                        </div>
                    </MDBCardBody>
                    </MDBCard>

                    <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                        <MDBCardText className="m-3 h5">General Information</MDBCardText>
                        <MDBCardText className="mt-1 m-3 p">text here </MDBCardText>
                    </MDBCard>

                    <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                        <MDBCardText className="m-3 h5">Biography</MDBCardText>
                        <MDBCardText className="mt-1 m-3 p">text here </MDBCardText>
                    </MDBCard>

                    <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                        <MDBCardText className="m-3 h5">Interests</MDBCardText>
                        <MDBCardText className="mt-1 m-3 p">text here </MDBCardText>
                    </MDBCard>

                    <MDBCard style={{ borderRadius: '15px' }} className="mt-3 mb-5">
                        <MDBCardText className="m-3 h5">Groups</MDBCardText>
                        <MDBCardText className="mt-1 m-3 p">text here </MDBCardText>
                    </MDBCard>
                </MDBCol>
                </MDBRow>

            </MDBContainer>
        </div>
        </>
    );
}

export default Profile;
