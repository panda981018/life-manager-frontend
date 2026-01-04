import { useState } from "react";

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setValues({
      ...values,
      [name]: newValue,
    });
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  const setFieldValue = (name, value) => {
    setValues({
      ...values,
      [name]: value,
    });
  };

  return {
    values,
    handleChange,
    resetForm,
    setFieldValue,
    setValues,
  };
};
