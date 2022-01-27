import { EEnergyType } from "../station-energyType.enum";


export class GetStationFilterDto{
    energyType: EEnergyType;
    search : string;
}