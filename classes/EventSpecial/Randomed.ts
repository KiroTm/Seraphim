import { AllAnimals } from "./types";

export class RandomedClass {
  public getRandomAnimal() {
    const animalsArray = Object.values(AllAnimals);

    const totalWeight = animalsArray.reduce((acc, animal) => acc + animal.weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let currentWeight = 0;

    const randomAnimal = animalsArray.find(animal => {
      currentWeight += animal.weight;
      return randomWeight <= currentWeight;
    });

    return randomAnimal
  }

  public getRandomEconomyReply(outcome: 'success' | 'neutral' | 'fail'): string {
    const successResponses: string[] = [
      `You successfully hunted a {animal}!`,
      `Nice job! You caught a {animal}.`,
      `You managed to hunt down a {animal}.`,
      `You've bagged a {animal}!`,
      `Impressive! You've got a {animal}.`,
      `A {animal} is now in your possession!`
    ];
    const neutralResponses: string[] = [
      `You didn't find any {animal} this time.`,
      `No luck with the {animal} this time.`,
      `The {animal} eluded you this time.`,
      `The {animal} remains elusive.`,
      `No sign of the {animal} this round.`,
      `The {animal} managed to escape your grasp.`
    ];
    const failResponses: string[] = [
      `The {animal} got away.`,
      `You missed the {animal}.`,
      `Better luck next time with the {animal}.`,
      `The {animal} slipped through your fingers.`,
      `The {animal} evaded capture this time.`,
      `The {animal} proved too quick for you.`
    ];

    function pickRandom<T>(array: Array<T>) {
      const arr = [...array];
      return arr[Math.floor(Math.random() * arr.length)];
    }

    let response: string;

    if (outcome === 'success') {
      response = pickRandom(successResponses);
    } else if (outcome === 'neutral') {
      response = pickRandom(neutralResponses);
    } else {
      response = pickRandom(failResponses);
    }

    return response;
  }

}
