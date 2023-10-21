import { AllAnimals } from "./types";

export class RandomedClass {
    public getRandomAnimal(): string | null {
        const animalsArray = Object.entries(AllAnimals);
      
        const totalWeight = animalsArray.reduce((acc, [, animal]) => acc + animal.weight, 0);
        const randomWeight = Math.random() * totalWeight;
      
        let currentWeight = 0;
      
        const randomAnimal = animalsArray.find(([, animal]) => {
          currentWeight += animal.weight;
          return randomWeight <= currentWeight;
        });
      
        return randomAnimal ? randomAnimal[1].name : null;
    }

    public getRandomMaterial() {

    }


}