import { Candidate } from '../src/domain/models/Candidate';
import { PrismaClient } from '@prisma/client';
import { expect, jest, describe, beforeEach, test } from '@jest/globals';

// Agregar la interfaz aquí
interface CandidateData {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    education: any[];
    workExperience: any[];
    resumes: any[];
}

jest.mock('@prisma/client');

const prisma = new PrismaClient();

// Update the Candidate class import or add this type declaration
declare class Candidate {
    constructor(data: CandidateData);
    save(): Promise<CandidateData>;
    static findOne(id: number): Promise<Candidate | null>;
    id?: number;
}

describe('Pruebas para la clase Candidate', () => {
    const mockData: CandidateData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St',
        education: [],
        workExperience: [],
        resumes: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('debería crear un nuevo candidato correctamente', async () => {
        prisma.candidate.create = jest.fn().mockResolvedValue(mockData) as jest.Mock<Promise<CandidateData>>;
        const candidate = new Candidate(mockData);
        const result = await candidate.save();
        expect(result).toEqual(mockData);
        expect(prisma.candidate.create).toHaveBeenCalledWith({
            data: expect.objectContaining(mockData)
        });
    });

    test('debería actualizar un candidato existente correctamente', async () => {
        prisma.candidate.update = jest.fn().mockResolvedValue(mockData);
        const candidate = new Candidate(mockData);
        candidate.id = mockData.id;
        const result = await candidate.save();
        expect(result).toEqual(mockData);
        expect(prisma.candidate.update).toHaveBeenCalledWith({
            where: { id: mockData.id },
            data: expect.objectContaining(mockData)
        });
    });

    test('debería manejar errores de conexión a la base de datos al crear un candidato', async () => {
        const errorMessage = 'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.';
        prisma.candidate.create = jest.fn().mockRejectedValue(new Error(errorMessage));
        const candidate = new Candidate(mockData);
        await expect(candidate.save()).rejects.toThrow(errorMessage);
    });

    test('debería manejar errores de conexión a la base de datos al actualizar un candidato', async () => {
        const errorMessage = 'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.';
        prisma.candidate.update = jest.fn().mockRejectedValue(new Error(errorMessage));
        const candidate = new Candidate(mockData);
        candidate.id = mockData.id;
        await expect(candidate.save()).rejects.toThrow(errorMessage);
    });

    test('debería lanzar un error si no se encuentra el candidato al actualizar', async () => {
        const errorMessage = 'No se pudo encontrar el registro del candidato con el ID proporcionado.';
        prisma.candidate.update = jest.fn().mockRejectedValue(new Error(errorMessage));
        const candidate = new Candidate(mockData);
        candidate.id = mockData.id;
        await expect(candidate.save()).rejects.toThrow(errorMessage);
    });

    test('debería devolver null si no se encuentra un candidato', async () => {
        prisma.candidate.findUnique = jest.fn().mockResolvedValue(null);
        const result = await Candidate.findOne(999);
        expect(result).toBeNull();
    });

    test('debería devolver un candidato si se encuentra', async () => {
        prisma.candidate.findUnique = jest.fn().mockResolvedValue(mockData);
        const result = await Candidate.findOne(mockData.id);
        expect(result).toEqual(new Candidate(mockData));
    });
});

