import * as React from "react";
import { useState, useEffect } from 'react';
import { Box, Button, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CategoriaService, ViewCategoria } from "../../../../shared/services/api/Estoque/CategoriaService";
import AdicionarCategoria from "./AdicionarCategoria";
import { Busca } from "../../../../shared/components/barra-inicial/Busca";
import { BarraCategoria } from "./BarraCategoria";

export const ListarCategorias: React.FC = () => {
    const [rows, setRows] = useState<ViewCategoria[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openCategoria, setOpenCategoria] = React.useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterId, setFilterId] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);

    const handleOpenCategoria = () => setOpenCategoria(true);
    const handleCloseCategoria = () => setOpenCategoria(false);
    const titulo = "Categoria";

    const consultar = async () => {
        setIsLoading(true);
        try {
            const consulta = await CategoriaService.getAllList(page + 1, filterId);
            if (consulta instanceof Error) {
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
                setTotalRecords(0);
            }
        } catch (error) {
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

    const listar = async() => {
        try {
            await consultar();
        } catch (error) {
            console.error("Erro ao listar:", error); 
        }
    }

    const handleExcluir = async (id: number) => {
        try {
            const result = await CategoriaService.deleteCategoriaById(id);

            if (result instanceof Error) {
                console.error(result.message);
                alert(result.message);
                return;
            }

            alert("Categoria excluída com sucesso!");

        } catch (error) {
            console.error("Erro inesperado:", error);
        }
    };

    return (
        <Box
        >
            <Busca
                titulo={titulo}
                onFilterIdChange={handleFilterIdChange}
            />
            <BarraCategoria listar={listar}/>

            <TableContainer component={Paper} sx={{ m: 1, width: 'auto', marginLeft: '8%', marginRight: '2%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={1}>
                                    <LinearProgress variant='indeterminate' />
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={1}>
                                        Nenhuma categoria encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{row.nome}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleExcluir(row.id)}
                                                sx={{ mr: 1, height: '24px' }}
                                            >
                                                <DeleteIcon />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5]}
                component="div"
                count={totalRecords}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
            />
        </Box>
    );
};
