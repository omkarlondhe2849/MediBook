import React, { useState } from 'react';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [income, setIncome] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profilePhoto ? `${api.BASE_URL}/uploads/profiles/${user.profilePhoto}` : null);

  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (user?.role === 'DOCTOR') {
      const fetchIncome = async () => {
        try {
          const date = new Date();
          const res: any = await api.get(`/doctors/provider/${user.id}/income?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
          setIncome(res.income);
        } catch (e) {
          console.error("Failed to fetch income");
        }
      };
      fetchIncome();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setIdentityFile(e.target.files[0]);
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLicenseFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Upload Photo if selected
      if (photo) {
        const photoData = new FormData();
        photoData.append('file', photo);
        await api.post(`/api/users/${user.id}/profile-photo`, photoData);
      }

      // 2. Upload Identity Proof (Doctor Only)
      if (user.role === 'DOCTOR' && identityFile) {
        const identityData = new FormData();
        identityData.append('file', identityFile);
        await api.post(`/api/users/${user.id}/identity-proof`, identityData);
      }

      // 3. Upload License Copy (Doctor Only)
      if (user.role === 'DOCTOR' && licenseFile) {
        const licenseData = new FormData();
        licenseData.append('file', licenseFile);
        await api.post(`/api/users/${user.id}/license-copy`, licenseData);
      }

      // 4. Update Profile Info
      const updatedUser: any = await api.put(`/api/users/${user.id}`, formData);

      const token = localStorage.getItem('token') || '';
      login({ ...updatedUser, profilePhoto: photo ? 'updated' : updatedUser.profilePhoto }, token);

      alert('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12">
      {user?.role === 'DOCTOR' && income !== null && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg text-white">
          <div className="text-sm font-medium opacity-90 mb-1">Monthly Earnings</div>
          <div className="text-4xl font-bold">${income.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
            <span>📅</span> Current Month
          </div>
        </div>
      )}

      <div className="card shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Edit Profile
        </h1>

        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2 relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center h-full text-gray-500 text-2xl">
                {formData.name.charAt(0)}
              </span>
            )}
          </div>
          <label className="cursor-pointer text-sm text-blue-600 hover:underline">
            Change Photo
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          {user?.role === 'DOCTOR' && (
            <>
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Verification Documents</h3>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Identity Proof</label>
                  <input type="file" className="p-2 w-full text-sm border rounded" onChange={handleIdentityChange} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">License Copy</label>
                  <input type="file" className="p-2 w-full text-sm border rounded" onChange={handleLicenseChange} />
                </div>
              </div>
            </>
          )}

          <Button type="submit" fullWidth isLoading={loading}>
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
