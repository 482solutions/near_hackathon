import React, { useCallback, useRef, useState } from "react";

export const FormContext = React.createContext({
  form: {},
  handleFormChange: () => {},
});
const Form = ({ children, formInitialState }) => {
  const [form, setForm] = useState(formInitialState);
  const handleFormChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  return (
    <FormContext.Provider
      value={{
        form,
        handleFormChange,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

// export default React.memo(Form, (prev, next) => {
//   let isEqual = true;
//   const every = Object.values(next.form).every((i) => i === "");
//   if (every) return false;
//   for (let key in prev.form) {
//     if (next.form[key] !== prev.form[key]) {
//       isEqual = false;
//       break;
//     }
//   }

//   return isEqual;
// });

export default Form;
