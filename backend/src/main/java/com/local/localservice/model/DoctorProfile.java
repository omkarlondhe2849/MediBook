package com.local.localservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;


public class DoctorProfile extends Service {

    @JsonProperty("doctorName")
    public String getDoctorName() {
        return super.getTitle();
    }

    @JsonProperty("providerId")
    public Long getProviderId() {
        return super.getProviderId();
    }

    @JsonProperty("providerId")
    public void setProviderId(Long providerId) {
        super.setProviderId(providerId);
    }

    @JsonProperty("doctorName")
    public void setDoctorName(String doctorName) {
        super.setTitle(doctorName);
    }

    @JsonProperty("specialization")
    public String getSpecialization() {
        return super.getCategory();
    }

    @JsonProperty("specialization")
    public void setSpecialization(String specialization) {
        super.setCategory(specialization);
    }

    @JsonProperty("shortBio")
    public String getShortBio() {
        return super.getDescription();
    }

    @JsonProperty("shortBio")
    public void setShortBio(String shortBio) {
        super.setDescription(shortBio);
    }

    @JsonProperty("clinicCity")
    public String getClinicCity() {
        return super.getLocation();
    }

    @JsonProperty("clinicCity")
    public void setClinicCity(String clinicCity) {
        super.setLocation(clinicCity);
    }

    @JsonProperty("consultationFee")
    public java.math.BigDecimal getConsultationFee() {
        return super.getPrice();
    }

    @JsonProperty("consultationFee")
    public void setConsultationFee(java.math.BigDecimal consultationFee) {
        super.setPrice(consultationFee);
    }

    @JsonIgnore
    public String getLegacyTitle() {
        return super.getTitle();
    }

    @JsonProperty("isVerified")
    public Boolean getIsVerified() {
        return super.isVerified();
    }

    @JsonProperty("isVerified")
    public void setIsVerified(Boolean isVerified) {
        super.setVerified(isVerified);
    }

    @JsonProperty("kycDocumentPath")
    public String getKycDocumentPath() {
        return super.getKycDocumentPath();
    }

    @JsonProperty("kycDocumentPath")
    public void setKycDocumentPath(String kycDocumentPath) {
         super.setKycDocumentPath(kycDocumentPath);
    }

    private String profilePhoto;

    @JsonProperty("profilePhoto")
    public String getProfilePhoto() {
        return profilePhoto;
    }

    @JsonProperty("profilePhoto")
    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }
}


