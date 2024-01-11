// Report.js
import React from 'react';
import ReportData from '../pages/Reports'

interface ReportData {
    id: number;
    text: string;
    userId: number;
    postId: number;
}

interface ReportProps {
    report: ReportData;
}

const Report: React.FC<ReportProps> = ({ report }) => {
    return (
        <div className="card mb-3" key={report.id}>
            <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <h5 className="card-title"><strong>Post ID: {report.postId}</strong> </h5>
            </div>
                <p className="card-text" dangerouslySetInnerHTML={{ __html: report.text }} />
            </div>
            <div className="card-footer text-muted d-flex justify-content-between">
                <span className="mr-3">Reporting user's ID: {report.userId}</span>
              </div>
        </div>
    );
};

export default Report;