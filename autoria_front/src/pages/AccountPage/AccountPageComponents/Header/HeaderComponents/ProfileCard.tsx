import React, { useEffect, useState } from 'react';
import './ProfileCard.css';
import axios from 'axios';

type ProfileCardProps = {
    name: string;
    id: string;
    collapsed?: boolean;
};

type Profile = {
    firstName: string;
    lastName: string;
    region: string;
    city: string;
    rating: string | number | null;
    phoneNumber: string;
    photo: string;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ name, id, collapsed = false }) => {
    const [userData, setUserData] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5174/api/Accounts/GetUserById/${id}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        if (id && id !== '0') fetchUserData();
    }, [id]);

    const photoUrl = userData?.photo
        ? `http://localhost:5174/images/1200_${userData.photo}`
        : null;

    const initials = name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const rating = userData?.rating ?? 0;

    return (
        <div className={`profile-card ${collapsed ? 'collapsed' : ''}`}>
            {/* Avatar */}
            <div className="profile-avatar">
                {photoUrl ? (
                    <img src={photoUrl} alt={name} />
                ) : (
                    <span className="profile-initials">{initials}</span>
                )}
            </div>

            {/* Info — hidden when collapsed */}
            {!collapsed && (
                <div className="profile-details">
                    <div className="profile-header-row">
                        <h2 className="profile-name">
                            {userData
                                ? `${userData.firstName} ${userData.lastName}`
                                : name}
                        </h2>
                        <span className="profile-rating">{rating}/10 ★</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
