import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api/client';
import { useAuth } from '../../shared/context/AuthContext';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

const CreateDoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: user?.name ? `Dr. ${user.name}` : '',
    category: '',
    description: '',
    location: '',
    price: '',
    qualification: '',
    experienceYears: '',
    clinicName: '',
    clinicAddress: '',
    clinicState: '',
    clinicZip: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        providerId: user?.id,
        price: parseFloat(formData.price),
        experienceYears: parseInt(formData.experienceYears)
      };

      // Create Profile
      await api.post('/doctors', payload);

      // Upload KYC



      // Fetch new profile ID
      const profileRes: any = await api.get(`/doctors/search?name=${payload.title}`);

      const myProfiles = ((profileRes.doctors || []) as any[]).filter(p => p.providerId === user?.id);
      if (myProfiles.length > 0 && kycFile) {
        const profileId = myProfiles[0].id;
        const formData = new FormData();
        formData.append('file', kycFile);

        await fetch(`${api.BASE_URL}/doctors/${profileId}/upload-kyc`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      }

      alert("Profile submitted successfully. Pending Admin Approval.");
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create profile', error);
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Create Doctor Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Specialization"
              name="category"
              placeholder="e.g. Cardiologist"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <Input
              label="Consultation Fee ($)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Bio</label>
            <textarea
              className="input-field h-32"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Qualification"
              name="qualification"
              placeholder="e.g. MBBS, MD"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
            <Input
              label="Experience (Years)"
              name="experienceYears"
              type="number"
              value={formData.experienceYears}
              onChange={handleChange}
              required
            />
          </div>

          <h3 className="font-bold text-lg mt-6">Clinic Details</h3>
          <Input
            label="Clinic Name"
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            required
          />
          <Input
            label="Clinic Address"
            name="clinicAddress"
            value={formData.clinicAddress}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <Input
              label="State"
              name="clinicState"
              value={formData.clinicState}
              onChange={handleChange}
              required
            />
            <Input
              label="Zip Code"
              name="clinicZip"
              value={formData.clinicZip}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">KYC Document (Medical License/ID)</label>
            <input
              type="file"
              className="input-field"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </div>

          <Button type="submit" fullWidth isLoading={loading} className="mt-6">
            Submit Profile for Verification
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateDoctorProfile;
