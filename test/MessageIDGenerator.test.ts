import { MessageIDGenerator } from '../src/MessageIDGenerator'
import { GUIDGeneratorMock } from './mocks/GUIDGenerator.mock'

describe('MessageIDGenerator', () => {

    describe('#generateID()', () => {

        it('Should generate unique values each time when running on default generator', () => {
            const generator = new MessageIDGenerator()
            const values = []

            for (let i = 0; i < 10000; i++) {
                const newValue = generator.generateID()
                expect(values).not.toContain(newValue)
                values.push(newValue)
            }
        })

        it('Should not provide previously invalidated values', () => {
            const generator = new MessageIDGenerator(GUIDGeneratorMock())
            expect(generator.generateID()).toBe('1')
            expect(generator.generateID()).toBe('2')
            generator.invalidateID('3')
            expect(generator.generateID()).toBe('4')
            generator.invalidateID('6')
            expect(generator.generateID()).toBe('5')
            expect(generator.generateID()).toBe('7')
            generator.invalidateID('8')
            generator.invalidateID('9')
            generator.invalidateID('11')
            expect(generator.generateID()).toBe('10')
            expect(generator.generateID()).toBe('12')
        })
    })
})
