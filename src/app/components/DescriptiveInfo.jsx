import React from "react";

function DescriptiveInfo({ icon: Icon, bgColor, heading, description }) {
  return (
    <div className="flex flex-col gap-5 items-center">
      <div className={`p-4 text-white ${bgColor} rounded-full`}>
        <Icon size={30} />
      </div>

      <p className="text-2xl font-bold text-foreground">{heading}</p>

      <p className="text-overlay-muted tracking-wide text-center">
        {description}
      </p>
    </div>
  );
}

export default DescriptiveInfo;
