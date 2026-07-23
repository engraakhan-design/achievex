import { PredictionEngineService } from './prediction-engine.service';
describe('PredictionEngineService',()=>{const engine=new PredictionEngineService();
 it('projects a linear trend with transparent evidence',()=>{const r=engine.predict('LINEAR_TREND',[10,20,30,40]);expect(r.predictedValue).toBeCloseTo(50);expect(r.confidence).toBeCloseTo(1);expect(r.explanation).toMatchObject({method:'ordinary_least_squares'});});
 it('calculates a moving average',()=>{expect(engine.predict('MOVING_AVERAGE',[1,2,3,4],{}, {window:2}).predictedValue).toBeCloseTo(3.5);});
 it('returns bounded risk probability',()=>{const r=engine.predict('RISK_SCORE',[],{delay:2},{weights:{delay:1},intercept:-1});expect(r.probability).toBeGreaterThan(0);expect(r.probability).toBeLessThan(1);});
});
