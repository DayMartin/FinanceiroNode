import * as React from "react";
import { useState, useEffect } from 'react';
import { Box, Button, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import { EditProducao, EstoqueService, IApiResponseHistoric, IDetalheEstoque, IDetalheHistoric } from "../../shared/services/api/Estoque/EstoqueService";
import { Environment } from "../../shared/environment";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarraInicial } from "../../shared/components/barra-inicial/BarraInicial";
import { BarraEstoque } from "./components/BarraEstoque";
import { HistoricoModal } from "./components/ListarHistorico";
import { ItemProdutoModal } from "./components/ListarItemProduto";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import ProdutoEditViewDialog from "./components/VisualizarEditarProduto";


export const Estoque: React.VFC = () => {
    const [rows, setRows] = useState<IDetalheEstoque[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [openItemProduto, setOpenItemProduto] = useState(false);

    const [selectedEstoque, setSelectedEstoque] = useState<number | null>(null);
    const [selectedItemEstoque, setSelectedItemEstoque] = useState<number | null>(null);

    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterId, setFilterId] = useState('');
    const [selectedProd, setSelectedProds] = useState<IDetalheEstoque | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openEditView, setOpenEditView] = useState(false);


    const titulo = "Estoque";

    const consultar = async () => {
        setIsLoading(true);
        try {
            const consulta = await EstoqueService.getAllList(page + 1, filterId);
            if (consulta instanceof Error) {
                // alert(consulta.message);
                setRows([]);
                setTotalRecords(0);

            } else if (Array.isArray(consulta)) {
                setRows(consulta);
                setTotalRecords(consulta.total);

            } else if (typeof consulta === 'object') {
                setRows(consulta.rows);
                setTotalRecords(consulta.total);

            } else {
                setRows([]);
                // alert('Dados retornados não são válidos');
                setTotalRecords(0);

            }
        } catch (error) {
            // alert('Erro ao consultar estoque');
            setRows([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        consultar();
    }, [page, filterId]);

    const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterIdChange = (id: string) => {
        setFilterId(id);
        setPage(0);
    };

    const handleVisualizar = async (estoque_id: number) => {
        setSelectedEstoque(estoque_id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEstoque(null);
    };

    const handleVisualizarItemEstoque = async (estoque_id: number) => {
        setSelectedItemEstoque(estoque_id);
        setOpenItemProduto(true);
    };

    const handleCloseItemEstoque = () => {
        setOpenItemProduto(false);
        setSelectedItemEstoque(null);
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'Saída':
                return { color: 'red' };
            case 'Entrada':
                return { color: 'green' };
            case 'Defeito':
                return { color: 'orange' };
            default:
                return { fontWeight: 'bold' };
        }
    };

    const handleExcluir = async (id: number) => {
        try {
            const result = await EstoqueService.deleteEstoqueById(id);

            if (result instanceof Error) {
                console.error(result.message);
                alert(result.message);
                return;
            }

            alert("Estoque excluído com sucesso!");

        } catch (error) {
            console.error("Erro inesperado:", error);
        }
    };

    const listar = async () => {
        try {
            await consultar();
        } catch (error) {
            console.error("Erro ao listar:", error)
        }
    }

    const handleEditar = (prod: IDetalheEstoque) => {
        setSelectedProds(prod);
        setOpenEditView(true);
        setIsEditing(true);
    };

    const handleCloseProd = () => {
        setOpenEditView(false);
        setSelectedProds(null);
        setIsEditing(false);
    };

    const handleSave = async (updatedProd: EditProducao) => {
        try {
            await EstoqueService.updateById(updatedProd.id, updatedProd);
            await consultar();
        } catch (error) {
            alert('Erro ao atualizar Produto');
        }
    };


    return (
        <Box>
            <BarraInicial
                titulo={titulo}
                onFilterIdChange={handleFilterIdChange}
            />
            <BarraEstoque listar={listar} />

            <TableContainer component={Paper} sx={{ m: 1, width: 'auto', marginLeft: '8%', marginRight: '2%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell>Marca</TableCell>
                            <TableCell>Quantidade</TableCell>
                            <TableCell>Promoção</TableCell>
                            <TableCell>Valor promocional</TableCell>
                            <TableCell>Ações</TableCell>
                            <TableCell>Data</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <LinearProgress variant="indeterminate" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.nome}</TableCell>
                                    <TableCell>{row.categoria_id}</TableCell>
                                    <TableCell>{row.marca_id}</TableCell>
                                    <TableCell>{row.quantidade}</TableCell>
                                    <TableCell>{row.promocao}</TableCell>
                                    <TableCell>{row.valor_promocional}</TableCell>
                                    <TableCell>{row.data_criacao}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" startIcon={<VisibilityIcon />} onClick={() => handleVisualizar(row.id)}>
                                        </Button>
                                        <Button variant="contained" color="primary" startIcon={<MenuBookIcon />} onClick={() => handleVisualizarItemEstoque(row.id)}>
                                        </Button>
                                        <Button onClick={() => handleEditar(row)}>
                                        <EditIcon />
                                        </Button>
                                        <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={() => handleExcluir(row.id)}>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </TableContainer>

            {selectedEstoque && (
                <HistoricoModal
                    open={open}
                    idHistoric={selectedEstoque}
                    onClose={handleClose}
                    getTipoColor={getTipoColor}
                />
            )}
            {selectedItemEstoque && (
                <ItemProdutoModal
                    open={openItemProduto}
                    idHistoric={selectedItemEstoque}
                    onClose={handleCloseItemEstoque}
                    getTipoColor={getTipoColor}
                />
            )}
            {selectedProd && (
                <ProdutoEditViewDialog
                    open={openEditView}
                    prod={selectedProd}
                    isEditing={isEditing}
                    onClose={handleCloseProd}
                    onSave={handleSave}
                />
            )}
        </Box>
    );
};
