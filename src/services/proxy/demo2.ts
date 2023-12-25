import { ProxyExpressHandler } from '../../interfaces/expressHandler';

const apis: ProxyExpressHandler[] = [
  {
    path: '/path-demo-proxy',
    proxy: 'http://localhost:8080',
  },
];
export default apis;
