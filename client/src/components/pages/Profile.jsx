import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import Navbar from "../modules/Navbar";
import { getProfile, saveProfile } from "../../api/clubs.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBBtn, MDBTypography } from 'mdb-react-ui-kit';

function Profile() {
    const { googleUser } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        generalInfo: "",
        bio: "",
        interests: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await getProfile();
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.response?.data?.error || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleChange = (field, value) => {
        setProfile(prev => ({...prev, [field]: value}));
    };

    const toggleEdit = async () => {
        if (editMode) {
            try {
                await saveProfile({
                    generalInfo: profile.generalInfo,
                    bio: profile.bio,
                    interests: profile.interests,
                    name: googleUser.name,
                    picture: googleUser.picture,
                });
            } catch (err) {
                console.error("Error saving profile:", err);
                setError("Failed to save profile.");
            }
        }
        setEditMode(!editMode);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <p className="text-xl text-cyan-600">Loading...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <p className="text-xl text-red-500 font-semibold">{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={{ backgroundColor: '#eee' }}>
                <MDBContainer className="container" style={{ maxWidth: '90%', padding: '0 15px' }}>
                    <MDBRow className="justify-content-center align-items-center h-100 ">
                        <MDBCol md="12" lg="10" xl="8" style={{ padding: '0 15px' }}>
                            <MDBCard className="mt-5" style={{ borderRadius: '15px' }}>
                                <MDBCardBody className="text-center">
                                    <div className="d-flex justify-content-center mt-3 mb-4">
                                        <MDBCardImage
                                            src={googleUser ? googleUser.picture : "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"}
                                            className="rounded-circle"
                                            fluid
                                            style={{ width: "100px", height: "100px", objectFit: "cover"}}
                                        />
                                        <div className="d-flex flex-column align-items-start ms-3">
                                            <MDBTypography tag="h4">{googleUser ? googleUser.name : "Name"}</MDBTypography>
                                            <MDBCardText className="text-muted mb-2">{googleUser? googleUser.email : "Email"}</MDBCardText>
                                            <MDBCardText className="text-muted mb-4">Class Year</MDBCardText>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between text-center mt-5 mb-2 m-20">
                                        <div>
                                            <MDBCardText className="mb-1 h5">0</MDBCardText>
                                            <MDBCardText className="small text-muted mb-0">Events</MDBCardText>
                                        </div>
                                        <div className="px-3">
                                            <MDBCardText className="mb-1 h5">0</MDBCardText>
                                            <MDBCardText className="small text-muted mb-0">Groups</MDBCardText>
                                        </div>
                                    </div>
                                    <MDBBtn type="button" onClick={toggleEdit} size="sm" className="mt-3"
                                        style={{
                                            height: '40px',
                                            lineHeight: '40px',
                                            width: 'auto',
                                            textAlign: 'center',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                          }}>
                                        {editMode ? "Save Changes" : "Edit Info"}
                                    </MDBBtn>
                                </MDBCardBody>
                            </MDBCard>

                            <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                                <MDBCardText className="m-3 h5">General Information</MDBCardText>
                                <MDBCardText className="mt-1 m-3 p">
                                    {editMode ? (
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={profile.generalInfo}
                                            onChange={(e) => handleChange("generalInfo", e.target.value)}
                                        />
                                    ) : (
                                        profile.generalInfo
                                    )}
                                </MDBCardText>
                            </MDBCard>

                            <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                                <MDBCardText className="m-3 h5">Biography</MDBCardText>
                                <MDBCardText className="mt-1 m-3 p">
                                    {editMode ? (
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={profile.bio}
                                            onChange={(e) => handleChange("bio", e.target.value)}
                                        />
                                    ) : (
                                        profile.bio
                                    )}
                                </MDBCardText>
                            </MDBCard>

                            <MDBCard style={{ borderRadius: '15px' }} className="mt-3">
                                <MDBCardText className="m-3 h5">Interests</MDBCardText>
                                <MDBCardText className="mt-1 m-3 p">
                                    {editMode ? (
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={profile.interests}
                                            onChange={(e) => handleChange("interests", e.target.value)}
                                        />
                                    ) : (
                                        profile.interests
                                    )}
                                </MDBCardText>
                            </MDBCard>

                            <MDBCard style={{ borderRadius: '15px' }} className="mt-3 mb-5">
                                <MDBCardText className="m-3 h5">Groups</MDBCardText>
                                <MDBCardText className="mt-1 m-3 p">text here</MDBCardText>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            </div>
        </>
    );
}

export default Profile;
