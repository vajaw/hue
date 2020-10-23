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

import axios, { AxiosInstance, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create();
export default api;

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.data.status === -1) {
      throw new ApiError(response);
    }
    return response;
  },
  error => Promise.reject(error)
);

export class ApiError extends Error {
  trace!: string;

  constructor(response: AxiosResponse) {
    let message: string = response.data.message;
    let trace = '';

    if (response.data.content) {
      const content = JSON.parse(response.data.content);
      message = `${message} : ${content.error.message}`;
      trace = content.trace;
    }

    super(message);
    this.trace = trace;
  }
}