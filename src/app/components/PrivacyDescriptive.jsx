import React from "react";

function PrivacyDescriptive({ heading, description, bulletpoints }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-2xl sm:text-3xl font-bold">{heading}</p>
      <p className="text-sm md:text-base text-overlay-muted">{description}</p>

      <ul className="list-disc leading-5 text-overlay-muted ml-5 flex flex-col gap-3 text-sm md:text-base">
        {bulletpoints.map((bullet, index) => {
          return <li key={index}>{bullet}</li>;
        })}
      </ul>
    </div>
  );
}

export default PrivacyDescriptive;
