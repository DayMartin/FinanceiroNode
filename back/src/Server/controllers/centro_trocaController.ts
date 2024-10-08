import { Request, Response } from 'express';
// import db from '../database/conn'
import queryDatabase from '../database/queryPromise'
import { CentroTroca } from '../models/centro_troca.interface';
import { historicEstoqueService } from '../services/historicEstoqueService';


const centroTrocaController = {
    // Função para buscar todos os CentroTroca
    getTrocas: async (req: Request, res: Response) => {
        const { page = 1, limit = 5, id } = req.query;

        // Construir a consulta SQL com filtros e paginação
        let query = "SELECT * FROM centro_troca WHERE 1=1";
        let countQuery = "SELECT COUNT(*) AS total FROM centro_troca WHERE 1=1";

        const params: any[] = [];

        if (id) {
            query += " AND id = ?";
            countQuery += " AND id = ?";

            params.push(id);
        }

        // Consulta de contagem total
        try {
            const totalResult = await queryDatabase(countQuery, params);
            const total = totalResult[0].total;

            // Consulta de paginação
            query += " LIMIT ? OFFSET ?";
            params.push(parseInt(limit as string));
            params.push((parseInt(page as string) - 1) * parseInt(limit as string));

            const rows = await queryDatabase(query, params);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ error: "Nenhum registro encontrado" });
            }

            return res.status(200).json({
                rows,
                total, // Retornando a contagem total
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar registros" });
        }
    },

    // Função para criar um novo Troca
    createTroca: async (req: Request, res: Response) => {
        const { venda_id, compra_id, estoque_id, item_antigo_codBarra, item_novo_codBarra, motivo, descricaoTroca, fornecedor_id, responseUser } = req.body;
        const query = "INSERT INTO centro_troca ( venda_id, estoque_id, item_antigo_codBarra, item_novo_codBarra, motivo, descricaoTroca, send_fornecedor) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const mutationHistoricVenda = "INSERT INTO historicVenda ( venda_id, acao) VALUES (?,?)";
        const mutationItem_Produto_Old = 'UPDATE financeiro.item_produto SET status= ? WHERE codBarras = ?';
        const mutationItem_Produto_novo = 'UPDATE financeiro.item_produto SET status= ? WHERE codBarras = ?';
        const mutationTroca_fornecedor = "INSERT INTO troca_fornecedor ( codBarra_item, id_compra, fornecedor_id, status, descricaoDefeito) VALUES (?,?,?,?,?)";
        try {
            await queryDatabase(query, [venda_id, estoque_id, item_antigo_codBarra, item_novo_codBarra, motivo, descricaoTroca, responseUser]);

            const acao = `realizado troca de: ${item_antigo_codBarra} para: ${item_novo_codBarra} do produto: ${estoque_id} `
            await queryDatabase(mutationHistoricVenda, [venda_id, acao])
            await queryDatabase(mutationItem_Produto_novo, ['vendido', item_novo_codBarra]);

            if (motivo === 'defeito' ) {
                await queryDatabase(mutationItem_Produto_Old, ['foraEstoque', item_antigo_codBarra]);

                if (responseUser === true){
                    const statusTrocaFornecedor = 'solicitado'
                    const osResult = await queryDatabase(mutationTroca_fornecedor, [item_antigo_codBarra, compra_id, fornecedor_id, statusTrocaFornecedor, descricaoTroca]);
    
                    // Recuperar o ID da Troca recém-criada
                    const defeito_id = osResult.insertId;
                    await historicEstoqueService.createHistoricEstoque("Defeito", 1, estoque_id, defeito_id, fornecedor_id)
 
                } else if (responseUser === false){
                    await historicEstoqueService.createHistoricEstoque("DefeitoWithout", 1, estoque_id, fornecedor_id)

                }

            } else {
                await queryDatabase(mutationItem_Produto_Old, ['disponivel', item_antigo_codBarra]);
            }

            return res.status(201).json({ message: `Troca criado com sucesso` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao criar Troca" });
        }
    },


    // Função para editar um Troca existente
    // editTroca: async (req: Request, res: Response) => {
    //     const { id } = req.params;
    //     const { venda_id, item_antigo_codBarra, item_novo_codBarra, motivo, descricaoTroca } = req.body;

    //     const trocaExistsQuery = "SELECT * FROM centro_troca WHERE id = ?";
    //     const [trocaRows] = await queryDatabase(trocaExistsQuery, [id]);

    //     if (!trocaRows) {
    //         return res.status(404).json({ error: "Troca não encontrado" });
    //     }

    //     try {
    //         const updateQuery = `
    // 			UPDATE centro_troca 
    // 			SET venda_id = ?, item_antigo_codBarra = ?, item_novo_codBarra = ?, motivo = ?, descricaoTroca = ?
    // 			WHERE id = ?
    // 		`;
    //         await queryDatabase(updateQuery, [venda_id, item_antigo_codBarra, item_novo_codBarra, motivo, descricaoTroca]);

    //         return res.status(200).json({ message: "Fornecedor atualizado com sucesso" });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ error: "Erro ao atualizar Fornecedor" });
    //     }
    // },

    // Função para buscar uma Troca
    getTroca: async (req: Request, res: Response) => {
        const { id } = req.body;
        const query = "SELECT * FROM centro_troca WHERE id = ?";

        try {
            const [rows] = await queryDatabase(query, [id]);

            // Verificar se o centro_troca foi encontrado
            if (rows === null || rows === undefined) {
                return res.status(404).json({ error: "centro_troca não encontrado" });
            }

            // Se o centro_troca foi encontrado, retornar os dados
            return res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar centro_troca" });
        }
    },

};

export { centroTrocaController };
