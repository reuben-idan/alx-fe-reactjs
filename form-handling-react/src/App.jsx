import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import FormikForm from './components/formikForm';
import './App.css';

function App() {
  const [useFormik, setUseFormik] = useState(false);

  return (
    <div className="App">
      <div className="form-toggle">
        <button
          onClick={() => setUseFormik(false)}
          className={!useFormik ? 'active' : ''}
        >
          Controlled Components
        </button>
        <button
          onClick={() => setUseFormik(true)}
          className={useFormik ? 'active' : ''}
        >
          Formik Form
        </button>
      </div>

      {!useFormik ? <RegistrationForm /> : <FormikForm />}
    </div>
  );
}

export default App;
