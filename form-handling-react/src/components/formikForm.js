import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './formikForm.css';

// Validation schema
const RegistrationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters'),

  email: Yup.string().required('Email is required')
    .email('Invalid email format'),

  password: Yup.string().required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  confirmPassword: Yup.string().required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const FormikForm = () => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Simulate API call
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert('Registration successful!');
        resetForm();
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="formik-registration-container">
      <div className="formik-registration-form-wrapper">
        <h2>User Registration (Formik)</h2>
        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          }}
          validationSchema={RegistrationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="formik-registration-form">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <Field
                  type="text"
                  name="username"
                  className={`form-input ${errors.username && touched.username ? 'error' : ''}`}
                />
                <ErrorMessage name="username" component="span" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <Field
                  type="email"
                  name="email"
                  className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                />
                <ErrorMessage name="email" component="span" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <Field
                  type="password"
                  name="password"
                  className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                />
                <ErrorMessage name="password" component="span" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                />
                <ErrorMessage name="confirmPassword" component="span" className="error-message" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FormikForm;
