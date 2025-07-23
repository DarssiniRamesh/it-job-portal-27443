import React from "react";
import { useParams } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Job detail page for a specific job.
 */
const JobDetail = () => {
  const { jobId } = useParams();
  return (
    <div>
      <h2>Job Detail</h2>
      <p>Job information for ID: <b>{jobId}</b> goes here.</p>
    </div>
  );
};

export default JobDetail;
