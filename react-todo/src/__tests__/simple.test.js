import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Simple Test', () => {
  test('basic test works', () => {
    expect(1 + 1).toBe(2);
  });
});
