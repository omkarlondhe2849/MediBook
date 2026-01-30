package com.local.localservice.model;

public class User {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String createdAt;
    private String resetToken;
    private String resetTokenExpiry;
    private String profilePhoto;
    private String identityProof;
    private String licenseCopy;

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	public String getResetToken() {
		return resetToken;
	}
	public void setResetToken(String resetToken) {
		this.resetToken = resetToken;
	}
	public String getResetTokenExpiry() {
		return resetTokenExpiry;
	}
	public void setResetTokenExpiry(String resetTokenExpiry) {
		this.resetTokenExpiry = resetTokenExpiry;
	}
	public String getProfilePhoto() {
		return profilePhoto;
	}
	public void setProfilePhoto(String profilePhoto) {
		this.profilePhoto = profilePhoto;
	}
	public String getIdentityProof() {
		return identityProof;
	}
	public void setIdentityProof(String identityProof) {
		this.identityProof = identityProof;
	}
	public String getLicenseCopy() {
		return licenseCopy;
	}
	public void setLicenseCopy(String licenseCopy) {
		this.licenseCopy = licenseCopy;
	}
	@Override
	public String toString() {
		return "User [id=" + id + ", name=" + name + ", email=" + email + ", password=" + password + ", phone=" + phone
				+ ", role=" + role + ", createdAt=" + createdAt + ", getId()=" + getId() + ", getName()=" + getName()
				+ ", getEmail()=" + getEmail() + ", getPassword()=" + getPassword() + ", getPhone()=" + getPhone()
				+ ", getRole()=" + getRole() + ", getCreatedAt()=" + getCreatedAt() + ", getClass()=" + getClass()
				+ ", hashCode()=" + hashCode() + ", toString()=" + super.toString() + "]";
	}


    
}

