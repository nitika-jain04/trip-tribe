import React from "react";

function PrivacyDescriptive({ heading, description, bulletpoints }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-3xl font-extrabold">{heading}</p>
      <p className="text-base text-overlay-muted">{description}</p>

      <ul className="list-disc text-base leading-5 text-overlay-muted ml-5 flex flex-col gap-3">
        {bulletpoints.map((bullet, index) => {
          return <li key={index}>{bullet}</li>;
        })}
      </ul>
    </div>
  );
}

export default PrivacyDescriptive;
