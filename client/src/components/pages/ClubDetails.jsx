import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getID } from "../../api/clubs";

const ClubDetails = () => {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubDetails = async () => {
            try {
                const response = await getID(clubId);
                setClub(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching club details:", error);
                setLoading(false);
            }
        };

        fetchClubDetails();
    }, [clubId]);

    if (loading) {
        return <p className="text-center text-xl mt-10 text-cyan-600">Loading...</p>;
    }

    if (!club) {
        return <p className="text-center text-xl mt-10 text-red-500">Club not found.</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
            <div className="w-full max-w-4xl">
                {/* Back Button */}
                <button
                    className="mb-6 px-6 py-3 bg-white text-black text-md font-medium rounded-full border hover:bg-cyan-600 transition-all"
                    onClick={() => navigate("/")}
                >
                    ← Back to All Clubs
                </button>
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                    {/* Club Header */}
                    <div className="bg-cyan-100 text-black text-center py-8 px-6">
                        <h1 className="text-4xl font-extrabold">{club.name}</h1>
                        <p className="text-lg mt-2">{club.mission}</p>
                    </div>
                    {/* Club Details */}
                    <div className="p-8 space-y-6">
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Type:</strong> {club.type}
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Active:</strong> {club.is_active ? "Yes" : "No"}
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Recruitment Cycle:</strong> {club.recruiting_cycle}
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Membership Process:</strong> {club.membership_process}
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Email:</strong>{" "}
                                <a
                                    href={`mailto:${club.email}`}
                                    className="text-cyan-600 hover:underline"
                                >
                                    {club.email}
                                </a>
                            </p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-700">
                                <strong>Website:</strong>{" "}
                                <a
                                    href={club.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-600 hover:underline"
                                >
                                    {club.website}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDetails;