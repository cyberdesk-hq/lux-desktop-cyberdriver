import React, { useState } from 'react';
import Dropdown from './Dropdown';
import OptionsIcon from './OptionsIcon';
import { invoke } from '@tauri-apps/api/core';

const Options: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openBaseUrl, setOpenBaseUrl] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <>
      <Dropdown
        open={openDropdown}
        setOpen={setOpenDropdown}
        options={[
          {
            key: 'baseUrl',
            label: 'Local Server URL',
            onClick: () => setOpenBaseUrl(true),
          },
        ]}
        position="bottom-left"
      >
        <button
          className="rounded-full hover:bg-accent-b"
          onClick={() => setOpenDropdown(true)}
        >
          <OptionsIcon />
        </button>
      </Dropdown>
      {openBaseUrl && (
        <>
          <div
            className="absolute inset-0 backdrop-blur-xs z-20"
            onClick={() => setOpenBaseUrl(false)}
          />
          <div className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-accent-b-2 px-2 pt-4 pb-8">
            <div className="flex flex-col items-center gap-6 w-96 px-8">
              <span className="text-lg">
                Enter the URL to connect to local server
              </span>
              <form
                className="flex flex-col w-full"
                onSubmit={e => {
                  e.preventDefault();
                  const values = Object.fromEntries(
                    new FormData(e.target as HTMLFormElement),
                  ) as { url: string };
                  if (typeof values.url !== 'string') {
                    setError('Please enter an valid URL');
                    return;
                  }
                  try {
                    new URL(values.url);
                  } catch {
                    setError('Please enter an valid URL');
                    return;
                  }
                  invoke('set_base_url', { url: values.url })
                    .then(() => setOpenBaseUrl(false))
                    .catch(err => setError(err));
                }}
              >
                <input
                  className="rounded-lg bg-[rgba(219,223,230,0.35)] p-2.5 w-full"
                  name="url"
                  placeholder="Enter URL"
                />
                {error && (
                  <span className="rounded-lg p-2.5 mt-2 bg-error/8 text-error">
                    {error}
                  </span>
                )}
                <button
                  className="rounded-lg bg-primary-DEFAULT border border-accent-c-4 w-full mt-4 py-2 px-2.5 text-base text-accent-b-3 font-medium"
                  type="submit"
                >
                  Verify
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Options;
