import { useState } from "react";

interface Props {
  setAlias: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  accessOnEnter: (event: React.KeyboardEvent<HTMLElement>) => void;
}

const AuthenticationFields = (props: Props) => {
  return (
    <>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          size={50}
          id="aliasInput"
          aria-label="alias"
          placeholder="name@example.com"
          onKeyDown={props.accessOnEnter}
          onChange={(event) => props.setAlias(event.target.value)}
        />
        <label htmlFor="aliasInput">Alias</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control bottom"
          id="passwordInput"
          aria-label="password"
          placeholder="Password"
          onKeyDown={props.accessOnEnter}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <label htmlFor="passwordInput">Password</label>
      </div>
    </>
  );
};

export default AuthenticationFields;
