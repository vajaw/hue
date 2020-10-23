/**
 * Licensed to Cloudera, Inc. under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  Cloudera, Inc. licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import api from './api';
import { ApiError } from './api';
import { AxiosAdapter, AxiosPromise, AxiosRequestConfig } from 'axios';

const TEST_URL = 'http://test-url';

describe('api.ts', () => {
  it('interceptors.response', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.defaults.adapter = <AxiosAdapter>((config: AxiosRequestConfig): AxiosPromise<any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <AxiosPromise<any>>new Promise((resolve: any) => {
        const response = {
          data: {
            status: -1,
            message: 'Test msg',
            content: '{"error": {"message": "Test inner msg"}, "trace":"TraceStr"}'
          },
          status: 200,
          statusText: '',
          headers: [],
          config
        };
        resolve(response);
      });
    });

    let response!: ApiError;

    try {
      await api.get(TEST_URL);
    } catch (e) {
      response = e;
    }

    expect(response).toBeTruthy();
    expect(response.message).toBe('Test msg : Test inner msg');
    expect(response.trace).toBe('TraceStr');
  });

  it('ApiError', async () => {
    expect(ApiError).toBeTruthy();
  });
});