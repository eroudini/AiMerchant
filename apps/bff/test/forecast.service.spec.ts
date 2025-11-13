import { ForecastService } from '../src/forecast/forecast.service.js';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(async () => ({ data: { run_id: 'test', products: [] } })),
  },
}));

describe('ForecastService', () => {
  it('calls forecast service', async () => {
    const svc = new ForecastService();
    const data = await svc.recomputeForecast('acc-1', ['SKU1'], 30);
    expect(data).toHaveProperty('run_id');
  });
});
