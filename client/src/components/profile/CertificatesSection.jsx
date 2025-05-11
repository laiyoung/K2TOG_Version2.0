import React from 'react';
import './CertificatesSection.css';

const CertificatesSection = ({ certificates }) => {
    return (
        <div className="certificates-section">
            <div className="section-header">
                <h2>Certificates</h2>
            </div>

            {certificates.length > 0 ? (
                <div className="certificates-grid">
                    {certificates.map(certificate => (
                        <div key={certificate.id} className="certificate-card">
                            <div className="certificate-icon">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <div className="certificate-info">
                                <h3>{certificate.certificate_name}</h3>
                                <p className="class-name">{certificate.class_name}</p>
                                <p className="issue-date">
                                    Issued: {new Date(certificate.issue_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="certificate-actions">
                                <a
                                    href={certificate.certificate_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-download"></i>
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <i className="fas fa-certificate"></i>
                    <p>No certificates yet</p>
                    <p className="empty-state-subtext">
                        Complete classes to earn certificates
                    </p>
                </div>
            )}
        </div>
    );
};

export default CertificatesSection; 