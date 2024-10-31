import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AppDispatch, RootState } from '../../store';

export enum VerificationLevel {
  Undefined,
  Revoked,
  Checked,
  Verified
}

interface AttributeVerificationResult {
  verificationLevel: VerificationLevel;
  attributeHashMatched: boolean;
  merkleOnchainMatched: boolean;
  merkleOffchainMatched: boolean;
}

interface VerificationResult {
  ownerEtheriumAddress: string;
  ownerMatched: boolean;
  attributes: {
    [prop: string]: AttributeVerificationResult;
  };
}

export interface Session {
  id: string;
  uuid: string;
  status: 'pending' | 'verifying' | 'completed';
  data: any;
  verificationResult: VerificationResult;
}

// Define a type for the slice state
interface VqrState {
  apiEndpoint: string;
}

// Define the initial state using that type
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const initialState: VqrState = {
  apiEndpoint: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8081'
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const vqrSlice = createSlice({
  name: 'vqr',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers(builder) {}
});

export const getSession = createAsyncThunk<
  Session,
  { sessionId: string },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('vqr/getSession', async ({ sessionId }, { getState, rejectWithValue }) => {
  try {
    const { apiEndpoint } = getState().vqr;
    const { data } = await axios.get(`/sessions/${sessionId}`, { baseURL: apiEndpoint });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const {} = vqrSlice.actions;

export default vqrSlice.reducer;
